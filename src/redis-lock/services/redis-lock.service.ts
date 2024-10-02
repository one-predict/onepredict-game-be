import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redlock from 'redlock';
import { LockOptions, LockService } from '@lock/services';

@Injectable()
export class RedisLockService implements LockService {
  private DEFAULT_LOCK_RETRIES_COUNT = -1;
  private THROW_ERROR_LOCK_RETRIES_COUNT = 1;
  private AUTO_EXTENSION_THRESHOLD = 0.3;

  constructor(@InjectRedis() private redisClient: Redis) {}

  public async lock<ReturnValue>(
    resources: string[],
    callback: () => Promise<ReturnValue>,
    duration: number,
    options?: LockOptions,
  ) {
    const redlock = new Redlock([this.redisClient], {
      retryCount: options?.throwErrorIfLocked ? this.THROW_ERROR_LOCK_RETRIES_COUNT : this.DEFAULT_LOCK_RETRIES_COUNT,
      automaticExtensionThreshold: duration * this.AUTO_EXTENSION_THRESHOLD,
    });

    return redlock.using(resources, duration, async () => {
      return callback();
    });
  }
}
