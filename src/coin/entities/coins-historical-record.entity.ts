import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { CoinsHistoricalRecord } from '@coin/schemas';
import { Coin } from '@coin/enums';

export interface CoinsHistoricalRecordEntity {
  getId(): string;
  getPrices(): Record<Coin, number>;
  getTimestamp(): number;
  getCompleted(): boolean;
}

export class MongoCoinsHistoricalRecordEntity implements CoinsHistoricalRecordEntity {
  constructor(private readonly coinsHistoricalRecordDocument: FlattenMaps<CoinsHistoricalRecord> & { _id: ObjectId }) {}

  public getId() {
    return this.coinsHistoricalRecordDocument._id.toString();
  }

  public getPrices() {
    return this.coinsHistoricalRecordDocument.prices;
  }

  public getCompleted() {
    return this.coinsHistoricalRecordDocument.completed;
  }

  public getTimestamp() {
    return this.coinsHistoricalRecordDocument.timestamp;
  }
}
