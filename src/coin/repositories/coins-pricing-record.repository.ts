import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { FindEntitiesQuery } from '@common/types';
import { transformSortArrayToSortObject } from '@common/utils';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { CoinsPricingRecord } from '@coin/schemas';
import { MongoCoinsPricingRecordEntity, CoinsPricingRecordEntity } from '@coin/entities';
import { Coin, CoinsPricingRecordSortField } from '@coin/enums';

export type FindCoinsPricingRecordEntitiesQuery = FindEntitiesQuery<
  {
    timestamps?: number[];
    completed?: boolean;
  },
  CoinsPricingRecordSortField
>;

export interface CreateCoinsPricingRecordEntityParams {
  prices: Partial<Record<Coin, number>>;
  timestamp: number;
}

export interface UpdateCoinsPricingRecordEntityParams {
  prices?: Partial<Record<Coin, number>>;
  completed?: boolean;
}

export interface CoinsPricingRecordRepository {
  find(query: FindCoinsPricingRecordEntitiesQuery): Promise<CoinsPricingRecordEntity[]>;
  updateOneById(id: string, params: UpdateCoinsPricingRecordEntityParams): Promise<CoinsPricingRecordEntity | null>;
  createMany(params: CreateCoinsPricingRecordEntityParams[]): Promise<CoinsPricingRecordEntity[]>;
}

@Injectable()
export class MongoCoinsPricingRecordRepository implements CoinsPricingRecordRepository {
  public constructor(
    @InjectModel(CoinsPricingRecord.name)
    private coinsPricingRecordModel: Model<CoinsPricingRecord>,
    @InjectTransactionsManager()
    private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindCoinsPricingRecordEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<CoinsPricingRecord> = {};

    if (query.filter.timestamps) {
      mongodbQueryFilter.timestamp = { $in: query.filter.timestamps };
    }

    if (query.filter.completed !== undefined) {
      mongodbQueryFilter.completed = query.filter.completed;
    }

    const records = await this.coinsPricingRecordModel
      .find(mongodbQueryFilter, undefined, {
        lean: true,
        skip: query.skip,
        limit: query.limit,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return records.map((record) => {
      return new MongoCoinsPricingRecordEntity(record);
    });
  }

  public async updateOneById(id: string, params: UpdateCoinsPricingRecordEntityParams) {
    const pricingUpdates = params.prices
      ? Object.keys(params.prices).reduce(
          (previousUpdates, key) => {
            previousUpdates[`prices.${key}`] = params.prices[key];

            return previousUpdates;
          },
          {} as Record<string, number>,
        )
      : {};

    const record = await this.coinsPricingRecordModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...pricingUpdates,
            completed: params.completed,
          },
        },
        { new: true, session: this.transactionsManager.getSession() },
      )
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return record && new MongoCoinsPricingRecordEntity(record);
  }

  public async createMany(params: CreateCoinsPricingRecordEntityParams[]) {
    const records = await this.coinsPricingRecordModel.create(params);

    return records.map((recordDocument) => {
      return new MongoCoinsPricingRecordEntity(recordDocument);
    });
  }
}
