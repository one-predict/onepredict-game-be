import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { InjectDigitalAssetsTickService } from '@digital-assets/decorators';
import { DigitalAssetsTickService } from '@digital-assets/services';
import { ListDigitalAssetsTicksDto } from '@digital-assets/dto';

@Controller()
export default class DigitalAssetsPricesSnapshotController {
  constructor(
    @InjectDigitalAssetsTickService()
    private readonly digitalAssetsTickService: DigitalAssetsTickService,
  ) {}

  @Get('/digital-assets-ticks')
  @UseGuards(AuthGuard)
  public async list(@Query() query: ListDigitalAssetsTicksDto) {
    return this.digitalAssetsTickService.listForAssets(query.assetIds);
  }
}
