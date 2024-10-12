import * as Sentry from '@sentry/node';
import {chunk} from 'lodash';
import {Injectable, Logger} from '@nestjs/common';
import {ModeBasedCron} from '@common/decorators';
import {delay, getCurrentUnixTimestamp} from '@common/utils';
import {
  InjectDigitalAssetsApi,
  InjectDigitalAssetsPricesSnapshotEntityMapper,
  InjectDigitalAssetsPricesSnapshotRepository,
} from '@digital-assets/decorators';
import {DigitalAssetsPricesSnapshotRepository} from '@digital-assets/repositories';
import {DigitalAssetId} from '@digital-assets/enums';
import {DigitalAssetsApi} from '@digital-assets/api';
import {DigitalAssetsPricesSnapshotEntityMapper} from '@digital-assets/entity-mappers';
import {DigitalAssetsPricesSnapshotDto} from '@digital-assets/dto';

export interface DigitalAssetsPricesSnapshotService {
  listLatest(limit: number): Promise<DigitalAssetsPricesSnapshotDto[]>;
  listInInterval(intervalStart: number, intervalEnd: number): Promise<DigitalAssetsPricesSnapshotDto[]>;
  getByTimestamp(timestamp: number): Promise<DigitalAssetsPricesSnapshotDto | null>;
}

@Injectable()
export class DefaultDigitalAssetsPricesSnapshotService implements DigitalAssetsPricesSnapshotService {
  private readonly ASSETS_SNAPSHOTS_CHUNK_SIZE = 10;
  private readonly ASSETS_SNAPSHOTS_SYNC_DELAY = 1000; // 1 second in ms
  private readonly ASSETS_SNAPSHOT_THRESHOLD = 60 * 62; // 1 hour and 2 minutes in seconds

  constructor(
    @InjectDigitalAssetsPricesSnapshotRepository()
    private readonly digitalAssetsPricesSnapshotRepository: DigitalAssetsPricesSnapshotRepository,
    @InjectDigitalAssetsPricesSnapshotEntityMapper()
    private readonly digitalAssetsPricesSnapshotEntityMapper: DigitalAssetsPricesSnapshotEntityMapper,
    @InjectDigitalAssetsApi() private readonly digitalAssetsApi: DigitalAssetsApi,
  ) {}

  public async listLatest(limit: number) {
    const snapshots = await this.digitalAssetsPricesSnapshotRepository.findLatest(limit);

    return this.digitalAssetsPricesSnapshotEntityMapper.mapMany(snapshots);
  }

  public async listInInterval(intervalStart: number, intervalEnd: number) {
    const snapshots = await this.digitalAssetsPricesSnapshotRepository.findByInterval(intervalStart, intervalEnd);

    return this.digitalAssetsPricesSnapshotEntityMapper.mapMany(snapshots);
  }

  public async getByTimestamp(timestamp: number) {
    const snapshot = await this.digitalAssetsPricesSnapshotRepository.findByTimestamp(timestamp);

    return snapshot ? this.digitalAssetsPricesSnapshotEntityMapper.mapOne(snapshot) : null;
  }

  @ModeBasedCron('*/5 * * * *')
  public async takeSnapshots() {
    const currentTimestamp = getCurrentUnixTimestamp();

    const [latestSnapshot] = await this.listLatest(1);

    const timeDifference = currentTimestamp - (latestSnapshot?.timestamp ?? 0);

    if (timeDifference < this.ASSETS_SNAPSHOT_THRESHOLD) {
      return;
    }

    const groupedAssetPrices: Record<number, Record<string, number>> = {};
    const assetsChunks = chunk(Object.values(DigitalAssetId), this.ASSETS_SNAPSHOTS_CHUNK_SIZE);

    for (const assets of assetsChunks) {
      for (const assetId of assets) {
        try {
          const history = await this.digitalAssetsApi.getAssetHourlyHistory(assetId as DigitalAssetId);

          history.forEach((historyItem) => {
            if (latestSnapshot && latestSnapshot.timestamp >= historyItem.time) {
              return;
            }

            if (!groupedAssetPrices[historyItem.time]) {
              groupedAssetPrices[historyItem.time] = {};
            }

            groupedAssetPrices[historyItem.time][assetId] = historyItem.open;
          });
        } catch (error) {
          Sentry.captureMessage(`Assets prices snapshot issue: ${error.message}`, {
            level: 'fatal',
          });

          Logger.error(`Failed to fetch asset prices history for ${assetId}`, error);

          throw error;
        }
      }

      await delay(this.ASSETS_SNAPSHOTS_SYNC_DELAY);
    }

    const snapshots = Object.keys(groupedAssetPrices).map((timestamp) => {
      return {
        timestamp: parseInt(timestamp),
        prices: groupedAssetPrices[timestamp],
      };
    });

    await this.digitalAssetsPricesSnapshotRepository.createMany(snapshots);
  }
}
