import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { FindEntitiesQuery } from '@common/types';
import { transformSortArrayToSortObject } from '@common/utils';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { CoinsHistoricalRecord } from '@coin/schemas';
import { MongoCoinsHistoricalRecordEntity, CoinsHistoricalRecordEntity } from '@coin/entities';
import { Coin, CoinsHistoricalRecordSortField } from '@coin/enums';

export type FindCoinsHistoricalRecordEntitiesQuery = FindEntitiesQuery<
  {
    timestamps?: number[];
    completed?: boolean;
  },
  CoinsHistoricalRecordSortField
>;

export interface CreateCoinsHistoricalRecordEntityParams {
  prices: Partial<Record<Coin, number>>;
  timestamp: number;
}

export interface UpdateCoinsHistoricalRecordEntityParams {
  prices?: Partial<Record<Coin, number>>;
  completed?: boolean;
}

export interface CoinsHistoricalRecordRepository {
  find(query: FindCoinsHistoricalRecordEntitiesQuery): Promise<CoinsHistoricalRecordEntity[]>;
  updateOneById(
    id: string,
    params: UpdateCoinsHistoricalRecordEntityParams,
  ): Promise<CoinsHistoricalRecordEntity | null>;
  createMany(params: CreateCoinsHistoricalRecordEntityParams[]): Promise<CoinsHistoricalRecordEntity[]>;
}

@Injectable()
export class MongoCoinsHistoricalRecordRepository implements CoinsHistoricalRecordRepository {
  public constructor(
    @InjectModel(CoinsHistoricalRecord.name)
    private coinsHistoricalRecordModel: Model<CoinsHistoricalRecord>,
    @InjectTransactionsManager()
    private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindCoinsHistoricalRecordEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<CoinsHistoricalRecord> = {};

    if (query.filter.timestamps) {
      mongodbQueryFilter.timestamp = { $in: query.filter.timestamps };
    }

    if (query.filter.completed !== undefined) {
      mongodbQueryFilter.completed = query.filter.completed;
    }

    const records = await this.coinsHistoricalRecordModel
      .find(mongodbQueryFilter, undefined, {
        lean: true,
        skip: query.skip,
        limit: query.limit,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return records.map((record) => {
      return new MongoCoinsHistoricalRecordEntity(record);
    });
  }

  public async updateOneById(id: string, params: UpdateCoinsHistoricalRecordEntityParams) {
    const pricingUpdates = Object.keys(params.prices || {}).reduce(
      (previousUpdates, key) => {
        previousUpdates[`prices.${key}`] = params.prices[key];

        return previousUpdates;
      },
      {} as Record<string, number>,
    );

    const record = await this.coinsHistoricalRecordModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...pricingUpdates,
            completed: params.completed,
          },
        },
        { new: true },
      )
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return record && new MongoCoinsHistoricalRecordEntity(record);
  }

  public async createMany(params: CreateCoinsHistoricalRecordEntityParams[]) {
    const records = await this.coinsHistoricalRecordModel.create(params);

    return records.map((recordDocument) => {
      return new MongoCoinsHistoricalRecordEntity(recordDocument);
    });
  }
}
