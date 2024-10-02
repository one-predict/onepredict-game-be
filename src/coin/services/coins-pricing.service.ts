import { Injectable, NotFoundException } from '@nestjs/common';
import { ModeBasedCron } from '@common/decorators';
import { InjectCoinsApi, InjectCoinsPricingInfoRepository } from '@coin/decorators';
import { CoinsPricingInfoRepository } from '@coin/repositories';
import { Coin } from '@coin/enums';
import { CoinsApi } from '@coin/api';
import { CoinsPricingInfoEntity } from '@coin/entities';

export interface CoinsPricingService {
  get(): Promise<CoinsPricingInfoEntity>;
}

@Injectable()
export class CoinsPricingServiceImpl implements CoinsPricingService {
  constructor(
    @InjectCoinsPricingInfoRepository() private readonly coinsPricingInfoRepository: CoinsPricingInfoRepository,
    @InjectCoinsApi() private readonly coinsApi: CoinsApi,
  ) {}

  public async get() {
    const info = await this.coinsPricingInfoRepository.findOne();

    if (!info) {
      throw new NotFoundException('Coins pricing info not found');
    }

    return info;
  }

  @ModeBasedCron('*/20 * * * *')
  public async fetchCoinsLatestPrices() {
    const coinsPricingDetails = await this.coinsApi.getCoinsLatestPrices(Object.values(Coin) as Coin[]);

    await this.coinsPricingInfoRepository.updateOne({ pricingDetails: coinsPricingDetails });
  }
}
