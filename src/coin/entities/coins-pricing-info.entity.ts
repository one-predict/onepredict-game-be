import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { CoinsPricingInfo, CoinsPricingDetails } from '@coin/schemas';

export interface CoinsPricingInfoEntity {
  getPricingDetails(): CoinsPricingDetails;
  getUpdatedAt(): Date;
}

export class MongoCoinsPricingInfoEntity implements CoinsPricingInfoEntity {
  constructor(private readonly coinsPricingInfoDocument: FlattenMaps<CoinsPricingInfo> & { _id: ObjectId }) {}

  public getPricingDetails() {
    return this.coinsPricingInfoDocument.pricingDetails;
  }

  public getUpdatedAt() {
    return this.coinsPricingInfoDocument.updatedAt;
  }
}
