import { Redis } from 'ioredis';
import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  OptionalFactoryDependency,
  InjectionToken,
} from '@nestjs/common';
import { RedisIdempotencyKeysStore } from '@idempotency/stores';

export interface BaseKeysStoreOptions {
  ttl?: number;
}

interface RedisKeysStoreOptions extends BaseKeysStoreOptions {
  redis: Redis;
}

export type IdempotencyKeysStoreOptions = RedisKeysStoreOptions;

export interface RootAsyncIdempotencyHostModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: unknown[]) => IdempotencyKeysStoreOptions | Promise<IdempotencyKeysStoreOptions>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

const IDEMPOTENCY_KEYS_STORE_OPTIONS_TOKEN = Symbol('IDEMPOTENCY_KEYS_STORE_OPTIONS_TOKEN');
const IDEMPOTENCY_KEYS_STORE_TOKEN = Symbol('IDEMPOTENCY_KEYS_STORE_TOKEN');

const DEFAULT_TTL_IN_SECONDS = 60 * 15; // 15 minutes

@Global()
@Module({})
export class IdempotencyHostModule {
  public static IDEMPOTENCY_KEYS_STORE_TOKEN = IDEMPOTENCY_KEYS_STORE_TOKEN;

  public static forRootAsync(options: RootAsyncIdempotencyHostModuleOptions): DynamicModule {
    return {
      module: IdempotencyHostModule,
      imports: options.imports,
      providers: [
        {
          provide: IDEMPOTENCY_KEYS_STORE_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: IDEMPOTENCY_KEYS_STORE_TOKEN,
          useFactory: (options: IdempotencyKeysStoreOptions) => {
            if ('redis' in options) {
              return new RedisIdempotencyKeysStore(options.redis, options.ttl ?? DEFAULT_TTL_IN_SECONDS);
            }

            throw new Error('Unsupported keys store');
          },
          inject: [IDEMPOTENCY_KEYS_STORE_OPTIONS_TOKEN],
        },
      ],
      exports: [IDEMPOTENCY_KEYS_STORE_TOKEN],
    };
  }
}
