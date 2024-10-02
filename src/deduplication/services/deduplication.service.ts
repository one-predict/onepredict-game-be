import { MongodbDeduplicationRecordRepository } from '@deduplication/repositories';
import { InjectDeduplicationRecordRepository } from '@deduplication/decorators';
import { DeduplicationError } from '@deduplication/errors';

export interface DeduplicationService {
  createDeduplicationRecord(deduplicationId: string): Promise<void>;
}

export class DefaultDeduplicationService implements DeduplicationService {
  constructor(
    @InjectDeduplicationRecordRepository()
    private readonly deduplicationRecordRepository: MongodbDeduplicationRecordRepository,
  ) {}

  public async createDeduplicationRecord(deduplicationId: string) {
    const inserted = await this.deduplicationRecordRepository.create(deduplicationId);

    if (!inserted) {
      throw new DeduplicationError(`Deduplication record with id "${deduplicationId}" already exists`);
    }
  }
}
