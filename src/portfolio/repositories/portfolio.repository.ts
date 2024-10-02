import { ObjectId } from 'mongodb';
import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cursor } from '@common/data';
import { FindEntitiesQuery } from '@common/types';
import { transformSortArrayToSortObject } from '@common/utils';
import { MongodbCursorAdapter } from '@common/adapters';
import { MatchRange } from '@common/data/aggregations';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { Portfolio, SelectedPortfolioToken } from '@portfolio/schemas';
import { PortfolioEntity, MongoPortfolioEntity } from '@portfolio/entities';

export type FindPortfolioEntitiesQuery = FindEntitiesQuery<
  {
    userId?: string;
    offerIds?: string[];
    isAwarded?: boolean;
    intervalStartsAfter?: number;
    intervalStartsBefore?: number;
    intervalEndsAfter?: number;
    intervalEndsBefore?: number;
  },
  string
>;

export interface CreatePortfolioEntityParams {
  user: string;
  selectedTokens: SelectedPortfolioToken[];
  offer: string;
  tournament: string | null;
  intervalStartTimestamp: number;
  intervalEndTimestamp: number;
  isAwarded: boolean;
}

export interface UpdatePortfolioEntityParams {
  isAwarded?: boolean;
  points?: number;
  earnedCoins?: number;
  appliedCardsStack?: Record<string, number>;
}

export interface PortfolioRepository {
  find(params: FindPortfolioEntitiesQuery): Promise<PortfolioEntity[]>;
  findAsCursor(params: FindPortfolioEntitiesQuery): Cursor<PortfolioEntity>;
  findById(id: string): Promise<PortfolioEntity | null>;
  createOne(params: CreatePortfolioEntityParams): Promise<PortfolioEntity>;
  updateOneById(id: string, params: UpdatePortfolioEntityParams): Promise<PortfolioEntity | null>;
}

@Injectable()
export class MongoPortfolioRepository implements PortfolioRepository {
  public constructor(
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindPortfolioEntitiesQuery) {
    const portfolioDocuments = await this.createMongodbFindQuery(query).exec();

    return portfolioDocuments.map((portfolioDocument) => {
      return new MongoPortfolioEntity(portfolioDocument);
    });
  }

  public findAsCursor(query: FindPortfolioEntitiesQuery) {
    const cursor = this.createMongodbFindQuery(query).cursor();

    return new MongodbCursorAdapter(cursor, (portfolioDocument) => {
      return new MongoPortfolioEntity(portfolioDocument);
    });
  }

  public async findById(id: string) {
    const portfolioDocument = await this.portfolioModel
      .findOne({ _id: new ObjectId(id) })
      .lean()
      .exec();

    return portfolioDocument && new MongoPortfolioEntity(portfolioDocument);
  }

  public async createOne(params: CreatePortfolioEntityParams) {
    const [portfolioDocument] = await this.portfolioModel.create([params], {
      session: this.transactionsManager.getSession(),
    });

    return new MongoPortfolioEntity(portfolioDocument);
  }

  public async updateOneById(id: string, params: UpdatePortfolioEntityParams) {
    const portfolioDocument = await this.portfolioModel
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        params,
        { new: true, session: this.transactionsManager.getSession() },
      )
      .lean()
      .exec();

    return portfolioDocument && new MongoPortfolioEntity(portfolioDocument);
  }

  private createMongodbFindQuery(query: FindPortfolioEntitiesQuery) {
    const mongodbQueryFilter: FilterQuery<Portfolio> = {};

    if (query.filter.userId) {
      mongodbQueryFilter.user = new ObjectId(query.filter.userId);
    }

    if (query.filter.offerIds) {
      mongodbQueryFilter.offer = {
        $in: query.filter.offerIds.map((offerId) => new ObjectId(offerId)),
      };
    }

    if (query.filter.isAwarded !== undefined) {
      mongodbQueryFilter.isAwarded = query.filter.isAwarded;
    }

    if (query.filter.intervalStartsAfter || query.filter.intervalStartsBefore) {
      mongodbQueryFilter.intervalStartTimestamp = MatchRange(
        query.filter.intervalStartsAfter,
        query.filter.intervalStartsBefore,
      );
    }

    if (query.filter.intervalEndsAfter || query.filter.intervalEndsBefore) {
      mongodbQueryFilter.intervalEndTimestamp = MatchRange(
        query.filter.intervalEndsAfter,
        query.filter.intervalEndsBefore,
      );
    }

    return this.portfolioModel.find(mongodbQueryFilter, undefined, {
      lean: true,
      skip: query.skip,
      limit: query.limit,
      sort: query.sort && transformSortArrayToSortObject(query.sort),
      session: this.transactionsManager.getSession(),
    });
  }
}
