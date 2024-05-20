import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { MatchRange } from '@common/data/aggregations';
import { PortfolioOffer, TokenOffer } from '@portfolio/schemas';
import { MongoPortfolioOfferEntity, PortfolioOfferEntity } from '@portfolio/entities';
import { OfferStatus } from '@portfolio/enums';

export interface FindPortfolioOfferEntitiesParams {
  fromDay?: number;
  toDay?: number;
}

export interface CreatePortfolioOfferEntityParams {
  day: number;
  date: string;
  tokenOffers: TokenOffer[];
}

export interface UpdatePortfolioOfferEntityParams {
  pricingChanges?: Record<string, number>;
  offerStatus?: OfferStatus;
}

export interface PortfolioOfferRepository {
  find(params: FindPortfolioOfferEntitiesParams): Promise<PortfolioOfferEntity[]>;
  findLatest(): Promise<PortfolioOfferEntity | null>;
  findById(id: string): Promise<PortfolioOfferEntity | null>;
  findByDay(day: number): Promise<PortfolioOfferEntity | null>;
  findByOfferStatus(offerStatus: OfferStatus, beforeDay?: number): Promise<PortfolioOfferEntity[]>;
  createMany(params: CreatePortfolioOfferEntityParams[]): Promise<PortfolioOfferEntity[]>;
  updateOneById(id: string, params: UpdatePortfolioOfferEntityParams): Promise<PortfolioOfferEntity | null>;
}

@Injectable()
export class MongoPortfolioOfferRepository implements PortfolioOfferRepository {
  public constructor(
    @InjectModel(PortfolioOffer.name)
    private portfolioOfferModel: Model<PortfolioOffer>,
  ) {}

  public async find(params: FindPortfolioOfferEntitiesParams) {
    const query: mongoose.FilterQuery<PortfolioOffer> = {};

    if (params.fromDay || params.toDay) {
      query.day = MatchRange(params.fromDay, params.toDay);
    }

    const portfolioOfferDocuments = await this.portfolioOfferModel
      .find(query)
      .sort({ day: -1 })
      .lean()
      .exec();

    return portfolioOfferDocuments.map((portfolioOfferDocument) => {
      return new MongoPortfolioOfferEntity(portfolioOfferDocument);
    });
  }

  public async findLatest() {
    const portfolioOfferDocument = await this.portfolioOfferModel.findOne({}).sort({ day: -1 }).lean().exec();

    return portfolioOfferDocument && new MongoPortfolioOfferEntity(portfolioOfferDocument);
  }

  public async findByOfferStatus(offerStatus: OfferStatus, beforeDay?: number) {
    const query: mongoose.FilterQuery<PortfolioOffer> = {};

    query.offerStatus = offerStatus;

    if (beforeDay !== undefined) {
      query.day = { $lt: beforeDay };
    }

    const portfolioOfferDocuments = await this.portfolioOfferModel.find(query).sort({ day: 1 }).lean().exec();

    return portfolioOfferDocuments.map((portfolioOfferDocument) => {
      return new MongoPortfolioOfferEntity(portfolioOfferDocument);
    });
  }

  public async findById(id: string): Promise<PortfolioOfferEntity> {
    const portfolioOfferDocument = await this.portfolioOfferModel
      .findOne({ _id: new ObjectId(id) })
      .lean()
      .exec();

    return portfolioOfferDocument && new MongoPortfolioOfferEntity(portfolioOfferDocument);
  }

  public async findByDay(day: number) {
    const portfolioOfferDocument = await this.portfolioOfferModel.findOne({ day }).lean().exec();

    return portfolioOfferDocument && new MongoPortfolioOfferEntity(portfolioOfferDocument);
  }

  public async createMany(params: CreatePortfolioOfferEntityParams[]) {
    const portfolioOfferDocuments = await this.portfolioOfferModel.create(params);

    return portfolioOfferDocuments.map((portfolioOfferDocument) => {
      return new MongoPortfolioOfferEntity(portfolioOfferDocument);
    });
  }

  public async updateOneById(id: string, params: UpdatePortfolioOfferEntityParams) {
    const portfolioOfferDocument = await this.portfolioOfferModel
      .findOneAndUpdate(
        {
          _id: new ObjectId(id),
        },
        params,
        { new: true },
      )
      .lean()
      .exec();

    return portfolioOfferDocument && new MongoPortfolioOfferEntity(portfolioOfferDocument);
  }
}
