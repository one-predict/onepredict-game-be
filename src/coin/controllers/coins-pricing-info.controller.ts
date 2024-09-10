import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { InjectCoinsPricingService } from '@coin/decorators';
import { CoinsPricingService } from "@coin/services";
import { CoinsPricingInfoEntity } from "@coin";

@Controller()
export default class CoinsPricingInfoController {
  constructor(@InjectCoinsPricingService() private readonly coinsPricingService: CoinsPricingService) {}

  @Get('/coins-pricing-info')
  @UseGuards(AuthGuard)
  public async getCoinsPricingInfo() {
    const info = await this.coinsPricingService.get();

    return this.mapCoinsPricingInfoEntityToViewModel(info);
  }

  private mapCoinsPricingInfoEntityToViewModel(coinsPricingInfo: CoinsPricingInfoEntity) {
    return {
      pricingDetails: coinsPricingInfo.getPricingDetails(),
      updatedAt: coinsPricingInfo.getUpdatedAt(),
    };
  }
}
