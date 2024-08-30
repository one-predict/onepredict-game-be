import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { CoinsPricingRecord } from '@coin/schemas';
import { Coin } from '@coin/enums';

export interface CoinsPricingRecordEntity {
  getId(): string;
  getPrices(): Record<Coin, number>;
  getTimestamp(): number;
  getCompleted(): boolean;
}

export class MongoCoinsPricingRecordEntity implements CoinsPricingRecordEntity {
  constructor(private readonly coinsPricingRecordDocument: FlattenMaps<CoinsPricingRecord> & { _id: ObjectId }) {}

  public getId() {
    return this.coinsPricingRecordDocument._id.toString();
  }

  public getPrices() {
    return this.coinsPricingRecordDocument.prices;
  }

  public getCompleted() {
    return this.coinsPricingRecordDocument.completed;
  }

  public getTimestamp() {
    return this.coinsPricingRecordDocument.timestamp;
  }
}
