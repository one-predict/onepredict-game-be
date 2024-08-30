import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { MatchRange } from '@common/data/aggregations';
import { TokensOffer } from '@coin/schemas';
import { MongoTokensOfferEntity, TokensOfferEntity } from '@coin/entities';
import { TokensOfferSortField } from '@coin/enums';
import { FindEntitiesQuery } from '@common/types';
import transformSortArrayToSortObject from '../../common/utils/mongoose.utils';

export type FindTokensOfferEntitiesQuery = FindEntitiesQuery<
  {
    startsAfter?: number;
    startsBefore?: number;
    tournamentId?: string | null;
  },
  TokensOfferSortField
>;

export interface CreateTokensOfferEntityParams {
  timestamp: number;
  opensAfterTimestamp: number;
  durationInSeconds: number;
  tokens: string[];
}

export interface TokensOfferRepository {
  find(query: FindTokensOfferEntitiesQuery): Promise<TokensOfferEntity[]>;
  findById(id: string): Promise<TokensOfferEntity | null>;
  createMany(params: CreateTokensOfferEntityParams[]): Promise<TokensOfferEntity[]>;
}

@Injectable()
export class MongoTokensOfferRepository implements TokensOfferRepository {
  public constructor(
    @InjectModel(TokensOffer.name) private readonly tokensOfferModel: Model<TokensOffer>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async find(query: FindTokensOfferEntitiesQuery) {
    const mongodbQueryFilter: mongoose.FilterQuery<TokensOffer> = {};

    if (query.filter.startsAfter || query.filter.startsBefore) {
      mongodbQueryFilter.timestamp = MatchRange(query.filter.startsAfter, query.filter.startsBefore);
    }

    if (query.filter.tournamentId !== undefined) {
      mongodbQueryFilter.tournament = query.filter.tournamentId;
    }

    const tokensOfferDocuments = await this.tokensOfferModel
      .find(mongodbQueryFilter, undefined, {
        lean: true,
        skip: query.skip,
        limit: query.limit,
        sort: query.sort && transformSortArrayToSortObject(query.sort),
        session: this.transactionsManager.getSession(),
      })
      .exec();

    return tokensOfferDocuments.map((tokensOfferDocument) => {
      return new MongoTokensOfferEntity(tokensOfferDocument);
    });
  }

  public async findById(id: string) {
    const tokensOfferDocument = await this.tokensOfferModel
      .findOne({ _id: new ObjectId(id) })
      .lean()
      .exec();

    return tokensOfferDocument && new MongoTokensOfferEntity(tokensOfferDocument);
  }

  public async createMany(params: CreateTokensOfferEntityParams[]) {
    const tokensOfferDocuments = await this.tokensOfferModel.create(params);

    return tokensOfferDocuments.map((tokensOfferDocument) => {
      return new MongoTokensOfferEntity(tokensOfferDocument);
    });
  }
}
