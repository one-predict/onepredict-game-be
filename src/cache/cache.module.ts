import { createCache } from 'cache-manager';
import { DynamicModule, Module } from '@nestjs/common';
import { CacheHostModule, CacheHostModuleOptions } from './host';
import { getCacheManagerToken } from './utils';
import { DefaultCacheManager } from './managers';

export type CacheModuleOptions = CacheHostModuleOptions;

@Module({})
export class CacheModule {
  public static getCacheManagerToken = getCacheManagerToken;

  public static register(cacheNamespace: string): DynamicModule {
    return {
      module: CacheModule,
      imports: [],
      providers: [
        {
          provide: getCacheManagerToken(cacheNamespace),
          useFactory: (cache: ReturnType<typeof createCache>) => {
            return new DefaultCacheManager(cache, cacheNamespace);
          },
          inject: [CacheHostModule.getCacheToken(cacheNamespace)],
        },
      ],
      exports: [getCacheManagerToken(cacheNamespace)],
    };
  }

  public static forRoot(options: CacheModuleOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: [CacheHostModule.forRoot(options)],
    };
  }
}
