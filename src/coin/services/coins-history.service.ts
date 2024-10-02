import * as Sentry from '@sentry/node';
import { chunk } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { ModeBasedCron } from '@common/decorators';
import { delay, getCurrentUnixTimestamp, getNearestHourInUnixTimestamp } from '@common/utils';
import { SortDirection } from '@common/enums';
import { InjectCoinsApi, InjectCoinsHistoricalRecordRepository } from '@coin/decorators';
import { CoinsHistoricalRecordRepository, FindCoinsHistoricalRecordEntitiesQuery } from '@coin/repositories';
import { Coin, CoinsHistoricalRecordSortField } from '@coin/enums';
import { CoinsApi } from '@coin/api';
import { CoinsHistoricalRecordEntity } from '@coin/entities';

export type ListCoinsHistoricalRecordsParams = FindCoinsHistoricalRecordEntitiesQuery;

export interface CoinsHistoryService {
  list(params: ListCoinsHistoricalRecordsParams): Promise<CoinsHistoricalRecordEntity[]>;
  listLatestCompletedForPeriod(period: number): Promise<CoinsHistoricalRecordEntity[]>;
}

@Injectable()
export class CoinsHistoryServiceImpl implements CoinsHistoryService {
  private readonly COINS_HISTORY_SYNC_CHUNK_SIZE = 10;
  private readonly COINS_HISTORY_SYNC_DELAY = 1000; // 1 second in ms
  private readonly HISTORY_RECORDS_GENERATION_THRESHOLD = 60 * 60 * 24 * 3; // 3 days in seconds
  private readonly NUMBER_OF_HISTORY_RECORDS_TO_GENERATE = 24 * 7; // 24 hours * 7 days
  private readonly HOURLY_INTERVAL = 60 * 60; // 1 hour in seconds
  private readonly HISTORY_SYNC_ALERT_THRESHOLD = 60 * 60 * 3; // 3 hours in seconds

  constructor(
    @InjectCoinsHistoricalRecordRepository()
    private readonly coinsHistoricalRecordRepository: CoinsHistoricalRecordRepository,
    @InjectCoinsApi() private readonly coinsApi: CoinsApi,
  ) {}

  public list(params: ListCoinsHistoricalRecordsParams) {
    return this.coinsHistoricalRecordRepository.find(params);
  }

  public listLatestCompletedForPeriod(period: number) {
    return this.coinsHistoricalRecordRepository.find({
      filter: {
        completed: true,
      },
      sort: [
        {
          field: CoinsHistoricalRecordSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: period + 1,
    });
  }

  @ModeBasedCron('10 * * * *')
  public async fetchCoinsHistory() {
    const groupedCoinsPricing: Record<number, Record<string, number>> = {};

    const chunks = chunk(Object.values(Coin), this.COINS_HISTORY_SYNC_CHUNK_SIZE);

    for (const chunk of chunks) {
      for (const coin of chunk) {
        try {
          const coinHistoryItems = await this.coinsApi.getCoinHourlyHistory(coin as Coin);

          coinHistoryItems.forEach((historyItem) => {
            if (!groupedCoinsPricing[historyItem.time]) {
              groupedCoinsPricing[historyItem.time] = {};
            }

            groupedCoinsPricing[historyItem.time][coin] = historyItem.open;
          });
        } catch (error) {
          Logger.error(`Failed to fetch coin history for ${coin}`, error);
        }
      }

      await delay(this.COINS_HISTORY_SYNC_DELAY);
    }

    const historyRecords = await this.coinsHistoricalRecordRepository.find({
      filter: {
        timestamps: Object.keys(groupedCoinsPricing).map(Number),
        completed: false,
      },
    });

    for (const historyRecord of historyRecords) {
      const newCoinsPrices = groupedCoinsPricing[historyRecord.getTimestamp()];
      const currentCoinsPrices = historyRecord.getPrices();

      const pricesChanges = Object.keys(newCoinsPrices).reduce(
        (previousPricingChanges, coin) => {
          if (newCoinsPrices[coin] !== currentCoinsPrices[coin]) {
            previousPricingChanges[coin] = newCoinsPrices[coin];
          }

          return previousPricingChanges;
        },
        {} as Partial<Record<Coin, number>>,
      );

      if (Object.keys(pricesChanges).length > 0) {
        await this.coinsHistoricalRecordRepository.updateOneById(historyRecord.getId(), {
          prices: pricesChanges,
        });
      }
    }
  }

  @ModeBasedCron('*/15 * * * *')
  public async finalizeCompletedHistoryRecords() {
    const historyRecords = await this.coinsHistoricalRecordRepository.find({
      filter: {
        completed: false,
      },
      sort: [
        {
          field: CoinsHistoricalRecordSortField.Timestamp,
          direction: SortDirection.Ascending,
        },
      ],
    });

    for (const historyRecord of historyRecords) {
      const coinsPrices = historyRecord.getPrices();

      const areAllCoinsPriced = Object.values(Coin).every((coin) => {
        return coinsPrices[coin] !== undefined;
      });

      if (areAllCoinsPriced) {
        await this.coinsHistoricalRecordRepository.updateOneById(historyRecord.getId(), {
          completed: true,
        });
      } else {
        break;
      }
    }
  }

  @ModeBasedCron('0 */12 * * *')
  public async generateEmptyHistoryRecords() {
    const [lastHistoryRecord] = await this.coinsHistoricalRecordRepository.find({
      filter: {},
      sort: [
        {
          field: CoinsHistoricalRecordSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: 1,
    });

    const currentTimestamp = getCurrentUnixTimestamp();

    if (
      lastHistoryRecord &&
      lastHistoryRecord.getTimestamp() - currentTimestamp > this.HISTORY_RECORDS_GENERATION_THRESHOLD
    ) {
      return;
    }

    const initialTimestamp = lastHistoryRecord ? lastHistoryRecord.getTimestamp() : getNearestHourInUnixTimestamp();

    await this.coinsHistoricalRecordRepository.createMany(
      new Array(this.NUMBER_OF_HISTORY_RECORDS_TO_GENERATE).fill(null).map((key, index) => ({
        timestamp: initialTimestamp + (index + 1) * this.HOURLY_INTERVAL,
        prices: {},
      })),
    );
  }

  @ModeBasedCron('*/15 * * * *')
  public async inspectHistoryRecordsIssues() {
    const [uncompletedHistoryRecord] = await this.coinsHistoricalRecordRepository.find({
      filter: {
        completed: false,
      },
      sort: [
        {
          field: CoinsHistoricalRecordSortField.Timestamp,
          direction: SortDirection.Ascending,
        },
      ],
      limit: 1,
    });

    if (!uncompletedHistoryRecord) {
      return;
    }

    const currentTimestamp = getCurrentUnixTimestamp();

    if (currentTimestamp - uncompletedHistoryRecord.getTimestamp() > this.HISTORY_SYNC_ALERT_THRESHOLD) {
      Sentry.captureMessage('Coins history records completion issue', {
        level: 'fatal',
      });
    }
  }
}
