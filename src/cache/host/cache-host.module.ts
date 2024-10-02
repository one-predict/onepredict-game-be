import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { Redis } from 'ioredis';
import { createCache } from 'cache-manager';
import { DynamicModule, Global, Module, ModuleMetadata, Provider } from '@nestjs/common';
import { getCacheToken } from './utils';

export interface BaseCacheStoreOptions {
  ttl?: number;
}

export interface RedisCacheStoreOptions extends BaseCacheStoreOptions {
  redis: Redis;
}

export interface MemoryCacheStoreOptions extends BaseCacheStoreOptions {
  max: number;
}

export type CacheStoreOptions = RedisCacheStoreOptions | MemoryCacheStoreOptions;

export interface CacheHostModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  cacheNamespaces: string[];
  stores: CacheStoreOptions[];
}

@Global()
@Module({})
export class CacheHostModule {
  public static getCacheToken = getCacheToken;

  public static forRoot(options: CacheHostModuleOptions): DynamicModule {
    const { providers, exports } = options.cacheNamespaces.reduce(
      (aggregation, cacheNamespace) => {
        aggregation.providers.push({
          provide: getCacheToken(cacheNamespace),
          useFactory: () => {
            return createCache({
              stores: options.stores.map((store) => {
                if ('redis' in store) {
                  return new Keyv({
                    store: new KeyvRedis(store.redis),
                  });
                } else {
                  return new Keyv({
                    store: new CacheableMemory({
                      lruSize: store.max,
                      ttl: store.ttl,
                    }),
                  });
                }
              }),
            });
          },
        });

        aggregation.exports.push(getCacheToken(cacheNamespace));

        return aggregation;
      },
      {
        providers: [] as Provider[],
        exports: [] as string[],
      },
    );

    return {
      module: CacheHostModule,
      imports: options.imports,
      providers: providers,
      exports: exports,
    };
  }
}
