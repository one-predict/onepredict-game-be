import * as Sentry from '@sentry/node';
import { chunk } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { delay, getCurrentUnixTimestamp, getNearestHourInUnixTimestamp } from '@common/utils';
import { SortDirection } from '@common/enums';
import { InjectCoinsApi, InjectCoinsPricingRecordRepository } from '@coin/decorators';
import { CoinsPricingRecordRepository, FindCoinsPricingRecordEntitiesQuery } from '@coin/repositories';
import { Coin, CoinsPricingRecordSortField } from '@coin/enums';
import { CoinsApi } from '@coin/api';
import { CoinsPricingRecordEntity } from '@coin/entities';

export type ListCoinsPricingRecordsParams = FindCoinsPricingRecordEntitiesQuery;

export interface CoinsPricingService {
  list(params: ListCoinsPricingRecordsParams): Promise<CoinsPricingRecordEntity[]>;
}

@Injectable()
export class CoinsPricingServiceImpl implements CoinsPricingService {
  private readonly COINS_PRICES_SYNC_CHUNK_SIZE = 10; // ms
  private readonly COINS_PRICES_SYNC_DELAY = 1000;
  private readonly PRICING_RECORDS_GENERATION_THRESHOLD = 60 * 60 * 24 * 3; // 3 days in seconds
  private readonly NUMBER_OF_PRICE_RECORDS_TO_GENERATE = 24 * 7; // 24 hours * 7 days
  private readonly HOURLY_INTERVAL = 60 * 60; // 1 hour in seconds

  private readonly PRICE_SYNC_ALERT_THRESHOLD = 60 * 60 * 2; // 3 hours in seconds

  constructor(
    @InjectCoinsPricingRecordRepository() private readonly coinsPricingRecordRepository: CoinsPricingRecordRepository,
    @InjectCoinsApi() private readonly coinsApi: CoinsApi,
  ) {}

  public list(params: ListCoinsPricingRecordsParams) {
    return this.coinsPricingRecordRepository.find(params);
  }

  @Cron('10 * * * *')
  public async syncCoinsPrices() {
    const groupedCoinsPricing: Record<number, Record<string, number>> = {};

    const chunks = chunk(Object.values(Coin), this.COINS_PRICES_SYNC_CHUNK_SIZE);

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

      await delay(this.COINS_PRICES_SYNC_DELAY);
    }

    const pricingRecords = await this.coinsPricingRecordRepository.find({
      filter: {
        timestamps: Object.keys(groupedCoinsPricing).map(Number),
        completed: false,
      },
    });

    for (const pricingRecord of pricingRecords) {
      const newCoinsPrices = groupedCoinsPricing[pricingRecord.getTimestamp()];
      const currentCoinsPrices = pricingRecord.getPrices();

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
        await this.coinsPricingRecordRepository.updateOneById(pricingRecord.getId(), {
          prices: pricesChanges,
        });
      }
    }
  }

  @Cron('*/15 * * * *')
  public async finalizeIncompletePriceRecords() {
    const pricingRecords = await this.coinsPricingRecordRepository.find({
      filter: {
        completed: false,
      },
      sort: [
        {
          field: CoinsPricingRecordSortField.Timestamp,
          direction: SortDirection.Ascending,
        },
      ],
    });

    for (const pricingRecord of pricingRecords) {
      const coinsPrices = pricingRecord.getPrices();

      const areAllCoinsPriced = Object.values(Coin).every((coin) => {
        return coinsPrices[coin] !== undefined;
      });

      if (areAllCoinsPriced) {
        await this.coinsPricingRecordRepository.updateOneById(pricingRecord.getId(), {
          completed: true,
        });
      } else {
        break;
      }
    }
  }

  @Cron('0 */12 * * *')
  public async generatePricingRecords() {
    const [lastPricingRecord] = await this.coinsPricingRecordRepository.find({
      filter: {},
      sort: [
        {
          field: CoinsPricingRecordSortField.Timestamp,
          direction: SortDirection.Descending,
        },
      ],
      limit: 1,
    });

    const currentTimestamp = getCurrentUnixTimestamp();

    if (
      lastPricingRecord &&
      lastPricingRecord.getTimestamp() - currentTimestamp > this.PRICING_RECORDS_GENERATION_THRESHOLD
    ) {
      return;
    }

    const initialTimestamp = lastPricingRecord ? lastPricingRecord.getTimestamp() : getNearestHourInUnixTimestamp();

    await this.coinsPricingRecordRepository.createMany(
      new Array(this.NUMBER_OF_PRICE_RECORDS_TO_GENERATE).fill(null).map((key, index) => ({
        timestamp: initialTimestamp + (index + 1) * this.HOURLY_INTERVAL,
        prices: {},
      })),
    );
  }

  @Cron('*/15 * * * *')
  public async inspectPricingSyncFailures() {
    const [uncompletedPricingRecord] = await this.coinsPricingRecordRepository.find({
      filter: {
        completed: false,
      },
      sort: [
        {
          field: CoinsPricingRecordSortField.Timestamp,
          direction: SortDirection.Ascending,
        },
      ],
      limit: 1,
    });

    if (!uncompletedPricingRecord) {
      return;
    }

    const currentTimestamp = getCurrentUnixTimestamp();

    if (currentTimestamp - uncompletedPricingRecord.getTimestamp() > this.PRICE_SYNC_ALERT_THRESHOLD) {
      Sentry.captureMessage('Pricing issue', {
        level: 'fatal',
      });
    }
  }
}
