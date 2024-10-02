import { Injectable } from '@nestjs/common';
import { createCache } from 'cache-manager';

export interface SetCacheOptions {
  ttl?: number;
}

export interface CacheManager {
  get<Data>(key: string): Promise<Data | null>;
  mget<Data>(keys: string[]): Promise<(Data | null)[]>;
  set<Data>(key: string, value: Data, options?: SetCacheOptions): Promise<void>;
  mset<Data>(list: Array<{ key: string; value: Data; ttl?: number }>): Promise<void>;
  delete(key: string): Promise<boolean>;
}

@Injectable()
export class DefaultCacheManager implements CacheManager {
  constructor(
    private cache: ReturnType<typeof createCache>,
    private namespace: string,
  ) {}

  public get<Data>(key: string) {
    return this.cache.get<Data>(this.getCacheKey(key));
  }

  public mget<Data>(keys: string[]) {
    return this.cache.mget<Data>(keys.map((key) => this.getCacheKey(key)));
  }

  public async set<Data>(key: string, value: Data, options?: SetCacheOptions) {
    await this.cache.set<Data>(this.getCacheKey(key), value, options?.ttl);
  }

  public async mset<Data>(list: Array<{ key: string; value: Data; ttl?: number }>) {
    await this.cache.mset(
      list.map(({ key, value, ttl }) => ({
        key: this.getCacheKey(key),
        value,
        ttl,
      })),
    );
  }

  public delete(key: string) {
    return this.cache.del(this.getCacheKey(key));
  }

  private getCacheKey(key: string) {
    return `${this.namespace}:${key}`;
  }
}
