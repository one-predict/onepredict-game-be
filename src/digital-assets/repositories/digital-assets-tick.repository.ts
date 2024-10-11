import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { DigitalAssetId } from '@digital-assets/enums';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { DigitalAssetLatestTick } from '@digital-assets/types';

export interface DigitalAssetsTickRepository {
  findByAssetIds(assetIds: DigitalAssetId[]): Promise<Record<string, DigitalAssetLatestTick>>;
  save(ticks: Record<string, DigitalAssetLatestTick>): Promise<void>;
}

@Injectable()
export class RedisDigitalAssetsTickRepository implements DigitalAssetsTickRepository {
  private readonly NAMESPACE = 'asset-ticks';

  public constructor(@InjectRedis() private redisClient: Redis) {}

  public async findByAssetIds(assetIds: DigitalAssetId[]) {
    const keys = assetIds.map((assetId) => this.getRedisKey(assetId));

    const serializedTicks = await this.redisClient.mget(keys);

    console.log('serializedTicks', serializedTicks);

    return serializedTicks.reduce(
      (ticks, serializedTick, index) => {
        if (serializedTick) {
          ticks[assetIds[index]] = JSON.parse(serializedTick);
        }

        return ticks;
      },
      {} as Record<DigitalAssetId, DigitalAssetLatestTick>,
    );
  }

  public async save(ticks: Record<string, DigitalAssetLatestTick>) {
    const map = Object.keys(ticks).reduce((previousMap, assetId) => {
      previousMap[this.getRedisKey(assetId as DigitalAssetId)] = JSON.stringify(ticks[assetId]);

      return previousMap;
    }, {});

    await this.redisClient.mset(map);
  }

  private getRedisKey(assetId: DigitalAssetId) {
    return `${this.NAMESPACE}:${assetId}`;
  }
}
