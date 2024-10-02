import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { DeduplicationRecord } from '@deduplication/schemas';
import { isDuplicatedMongoError } from '@common/utils';

export interface DeduplicationRecordRepository {
  create(id: string): Promise<boolean>;
}

export class MongodbDeduplicationRecordRepository implements DeduplicationRecordRepository {
  constructor(
    @InjectModel(DeduplicationRecord.name)
    private readonly deduplicationRecordModel: Model<DeduplicationRecord>,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
  ) {}

  public async create(id: string) {
    try {
      await this.deduplicationRecordModel.create([{ _id: id }], {
        session: this.transactionsManager.getSession(),
      });

      return true;
    } catch (error) {
      if (isDuplicatedMongoError(error)) {
        return false;
      }

      throw error;
    }
  }
}
