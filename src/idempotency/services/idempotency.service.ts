import { InjectLockService } from '@lock/decorators';
import { LockService } from '@lock/services';
import { IdempotencyConflictError } from '@idempotency/errors';
import { IdempotencyKeysStore } from '@idempotency/stores';
import { InjectIdempotencyKeysStore } from '@idempotency/decorators';

export interface UseIdempotentOperationOptions {
  skip?: boolean;
  lockDuration?: number;
}

export interface IdempotencyService {
  useIdempotentOperation<Result>(
    idempotencyKey: string,
    operation: () => Promise<Result>,
    options?: UseIdempotentOperationOptions,
  ): Promise<Result>;
}

export class DefaultIdempotencyService implements IdempotencyService {
  private DEFAULT_LOCK_DURATION = 1000 * 5; // 5 seconds

  constructor(
    @InjectLockService() private readonly lockService: LockService,
    @InjectIdempotencyKeysStore() private readonly idempotencyKeysStore: IdempotencyKeysStore,
  ) {}

  public useIdempotentOperation<Result>(
    idempotencyKey: string,
    operation: () => Promise<Result>,
    options?: UseIdempotentOperationOptions,
  ) {
    if (options?.skip) {
      return operation();
    }

    return this.lockService.lock(
      [`idempotency-lock:${idempotencyKey}`],
      async () => {
        const exists = await this.idempotencyKeysStore.exists(idempotencyKey);

        if (exists) {
          throw new IdempotencyConflictError('Idempotency key already exists');
        }

        const result = await operation();

        await this.idempotencyKeysStore.save(idempotencyKey);

        return result;
      },
      options?.lockDuration ?? this.DEFAULT_LOCK_DURATION,
    );
  }
}
