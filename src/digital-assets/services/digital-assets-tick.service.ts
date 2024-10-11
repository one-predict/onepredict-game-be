import { Injectable } from '@nestjs/common';
import { ModeBasedCron } from '@common/decorators';
import { InjectDigitalAssetsApi, InjectDigitalAssetsTickRepository } from '@digital-assets/decorators';
import { DigitalAssetsTickRepository } from '@digital-assets/repositories';
import { DigitalAssetId } from '@digital-assets/enums';
import { DigitalAssetsApi } from '@digital-assets/api';
import { DigitalAssetLatestTick } from '@digital-assets/types';

export interface DigitalAssetsTickService {
  listForAssets(assetIds: DigitalAssetId[]): Promise<Record<string, DigitalAssetLatestTick>>;
}

@Injectable()
export class DefaultDigitalAssetsTickService implements DigitalAssetsTickService {
  constructor(
    @InjectDigitalAssetsTickRepository()
    private readonly digitalAssetsTickRepository: DigitalAssetsTickRepository,
    @InjectDigitalAssetsApi() private readonly digitalAssetsApi: DigitalAssetsApi,
  ) {}

  public async listForAssets(assetIds: DigitalAssetId[]) {
    return this.digitalAssetsTickRepository.findByAssetIds(assetIds);
  }

  @ModeBasedCron('* * * * *')
  public async fetchLastTick() {
    const ticks = await this.digitalAssetsApi.getAssetLatestTick(Object.values(DigitalAssetId) as DigitalAssetId[]);

    await this.digitalAssetsTickRepository.save(ticks);
  }
}
