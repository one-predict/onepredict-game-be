import { Redis } from 'ioredis';
import { IdempotencyKeysStore } from './idempotency-keys.store';

export class RedisIdempotencyKeysStore implements IdempotencyKeysStore {
  private EXISTS_RESULT = 1;
  private SECONDS_TOKEN = 'EX' as const;

  constructor(
    private redis: Redis,
    private defaultTtlInSeconds: number,
  ) {}

  public exists(idempotencyKey: string) {
    return this.redis.exists(idempotencyKey).then((result) => {
      return result === this.EXISTS_RESULT;
    });
  }

  public async save(idempotencyKey: string) {
    await this.redis.set(idempotencyKey, 'true', this.SECONDS_TOKEN, this.defaultTtlInSeconds);
  }
}
