import { FlattenMaps } from 'mongoose';
import { ObjectId } from 'mongodb';
import { DigitalAssetsPricesSnapshot } from '@digital-assets/schemas';
import { DigitalAssetId } from '@digital-assets/enums';

export interface DigitalAssetsPricesSnapshotEntity {
  getId(): string;
  getPrices(): Record<DigitalAssetId, number>;
  getTimestamp(): number;
}

export class MongoDigitalAssetsPricesSnapshot implements DigitalAssetsPricesSnapshotEntity {
  constructor(
    private readonly digitalAssetsPricesSnapshotDocument: FlattenMaps<DigitalAssetsPricesSnapshot> & { _id: ObjectId },
  ) {}

  public getId() {
    return this.digitalAssetsPricesSnapshotDocument._id.toString();
  }

  public getPrices() {
    return this.digitalAssetsPricesSnapshotDocument.prices;
  }

  public getTimestamp() {
    return this.digitalAssetsPricesSnapshotDocument.timestamp;
  }
}
