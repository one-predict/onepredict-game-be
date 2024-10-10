import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { DigitalAssetId } from '@digital-assets/enums';
import { DigitalAssetsPricesSnapshot } from '@digital-assets/schemas';
import { DigitalAssetsPricesSnapshotEntity, MongoDigitalAssetsPricesSnapshot } from '@digital-assets/entities';

export interface CreateDigitalAssetsPricesSnapshotEntityParams {
  prices: Partial<Record<DigitalAssetId, number>>;
  timestamp: number;
}

export interface DigitalAssetsPricesSnapshotRepository {
  findByInterval(intervalStart: number, intervalEnd: number): Promise<DigitalAssetsPricesSnapshotEntity[]>;
  findLatest(limit: number): Promise<DigitalAssetsPricesSnapshotEntity[]>;
  createMany(params: CreateDigitalAssetsPricesSnapshotEntityParams[]): Promise<DigitalAssetsPricesSnapshotEntity[]>;
}

@Injectable()
export class MongoDigitalAssetsPricesSnapshotRepository implements DigitalAssetsPricesSnapshotRepository {
  public constructor(
    @InjectModel(DigitalAssetsPricesSnapshot.name)
    private digitalAssetsPricesSnapshotModel: Model<DigitalAssetsPricesSnapshot>,
    @InjectTransactionsManager()
    private readonly transactionsManager: TransactionsManager,
  ) {}

  public async findByInterval(intervalStart: number, intervalEnd: number) {
    const snapshots = await this.digitalAssetsPricesSnapshotModel
      .find({
        timestamp: { $gte: intervalStart, $lte: intervalEnd },
      })
      .sort({ timestamp: 1 })
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return snapshots.map((snapshot) => {
      return new MongoDigitalAssetsPricesSnapshot(snapshot);
    });
  }

  public async findLatest(limit: number) {
    const snapshots = await this.digitalAssetsPricesSnapshotModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .session(this.transactionsManager.getSession())
      .lean()
      .exec();

    return snapshots.map((snapshot) => {
      return new MongoDigitalAssetsPricesSnapshot(snapshot);
    });
  }

  public async createMany(params: CreateDigitalAssetsPricesSnapshotEntityParams[]) {
    const snapshots = await this.digitalAssetsPricesSnapshotModel.create(params);

    return snapshots.map((snapshotDocument) => {
      return new MongoDigitalAssetsPricesSnapshot(snapshotDocument);
    });
  }
}
