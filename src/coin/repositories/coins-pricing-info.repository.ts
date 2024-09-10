import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { CoinsPricingDetails, CoinsPricingInfo } from '@coin/schemas';
import { CoinsPricingInfoEntity, MongoCoinsPricingInfoEntity } from '@coin/entities';

export interface UpdateCoinsPricingInfoEntityParams {
  pricingDetails: Partial<CoinsPricingDetails>;
}

export interface CoinsPricingInfoRepository {
  findOne(): Promise<CoinsPricingInfoEntity | null>;
  updateOne(params: UpdateCoinsPricingInfoEntityParams): Promise<CoinsPricingInfoEntity | null>;
}

@Injectable()
export class MongoCoinsPricingInfoRepository implements CoinsPricingInfoRepository {
  public constructor(
    @InjectModel(CoinsPricingInfo.name)
    private coinsPricingInfoModel: Model<CoinsPricingInfo>,
    @InjectTransactionsManager()
    private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findOne() {
    const infoDocument = await this.coinsPricingInfoModel.findOne({})
      .lean()
      .session(this.transactionsManager.getSession())
      .exec();

    return infoDocument && new MongoCoinsPricingInfoEntity(infoDocument);
  }

  public async updateOne(params: UpdateCoinsPricingInfoEntityParams) {
    const pricingDetailsUpdates = Object.keys(params.pricingDetails).reduce((previousUpdates, key) => {
      previousUpdates[`pricingDetails.${key}`] = params.pricingDetails[key];

      return previousUpdates;
    }, {} as Record<string, CoinsPricingDetails>);

    const infoDocument = await this.coinsPricingInfoModel
      .findOneAndUpdate({}, { $set: pricingDetailsUpdates }, { new: true })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return infoDocument && new MongoCoinsPricingInfoEntity(infoDocument);
  }
}
