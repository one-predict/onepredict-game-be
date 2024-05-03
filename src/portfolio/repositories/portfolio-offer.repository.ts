import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { MatchRange } from '@common/data/aggregations';
import { PortfolioOffer, TokenOffer } from '@portfolio/schemas';
import { MongoPortfolioOfferEntity, PortfolioOfferEntity } from '@portfolio/entities';

export interface FindPortfolioOffersParams {
  fromDay?: number;
  toDay?: number;
}

export interface CreatePortfolioOfferParams {
  day: number;
  tokenOffers: TokenOffer[];
}

export interface PortfolioOfferRepository {
  find(params: FindPortfolioOffersParams): Promise<PortfolioOfferEntity[]>;
  findLatest(): Promise<PortfolioOfferEntity>;
  findById(id: string): Promise<PortfolioOfferEntity>;
  createMany(params: CreatePortfolioOfferParams[]): Promise<PortfolioOfferEntity[]>;
}

@Injectable()
export class MongoPortfolioOfferRepository implements PortfolioOfferRepository {
  public constructor(
    @InjectModel(PortfolioOffer.name)
    private portfolioOfferModel: Model<PortfolioOffer>,
  ) {}

  public async find(params: FindPortfolioOffersParams) {
    const query: mongoose.FilterQuery<PortfolioOffer> = {};

    if (params.fromDay || params.toDay) {
      query.day = MatchRange(params.fromDay, params.toDay);
    }

    const portfolioOfferDocuments = await this.portfolioOfferModel.find(query).lean().exec();

    return portfolioOfferDocuments.map((portfolioOfferDocument) => {
      return new MongoPortfolioOfferEntity(portfolioOfferDocument);
    });
  }

  public async findLatest() {
    const portfolioOfferDocument = await this.portfolioOfferModel.findOne({}).sort({ day: -1 }).exec();

    return portfolioOfferDocument && new MongoPortfolioOfferEntity(portfolioOfferDocument);
  }

  public async findById(id: string): Promise<PortfolioOfferEntity> {
    const portfolioOfferDocument = await this.portfolioOfferModel.findOne({ _id: new ObjectId(id) }).exec();

    return portfolioOfferDocument && new MongoPortfolioOfferEntity(portfolioOfferDocument);
  }

  public async createMany(params: CreatePortfolioOfferParams[]) {
    const portfolioOfferDocuments = await this.portfolioOfferModel.create(params);

    return portfolioOfferDocuments.map((portfolioOfferDocument) => {
      return new MongoPortfolioOfferEntity(portfolioOfferDocument);
    });
  }
}
