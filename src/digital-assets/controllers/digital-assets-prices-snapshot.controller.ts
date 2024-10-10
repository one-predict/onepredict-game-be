import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { InjectDigitalAssetsPricesSnapshotService } from '@digital-assets/decorators';
import { DigitalAssetsPricesSnapshotService } from '@digital-assets/services';
import { ListLatestDigitalAssetsPricesSnapshotsDto } from '@digital-assets/dto';

@Controller()
export default class DigitalAssetsPricesSnapshotController {
  constructor(
    @InjectDigitalAssetsPricesSnapshotService()
    private readonly digitalAssetsPricesSnapshotsService: DigitalAssetsPricesSnapshotService,
  ) {}

  @Get('/digital-assets-prices-snapshots/latest')
  @UseGuards(AuthGuard)
  public async listLatest(@Query() query: ListLatestDigitalAssetsPricesSnapshotsDto) {
    return this.digitalAssetsPricesSnapshotsService.listLatest(query.period);
  }
}
