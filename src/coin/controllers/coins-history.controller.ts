import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@common/guards';
import { InjectCoinsHistoryService } from '@coin/decorators';
import { CoinsHistoryService } from '@coin/services';
import { CoinsHistoricalRecordEntity } from '@coin/entities';
import { ListLatestCompletedCoinsHistoryDto } from '@coin/dto/coins-history.dto';

@Controller()
export default class CoinsHistoryController {
  constructor(@InjectCoinsHistoryService() private readonly coinsHistoryService: CoinsHistoryService) {}

  @Get('/coins-history/completed/latest')
  @UseGuards(AuthGuard)
  public async listLatestCompletedCoinsHistory(@Query() query: ListLatestCompletedCoinsHistoryDto) {
    const records = await this.coinsHistoryService.listLatestCompletedForPeriod(query.period);

    return records.map((record) => this.mapCoinsHistoricalRecordEntityToViewModel(record));
  }

  private mapCoinsHistoricalRecordEntityToViewModel(record: CoinsHistoricalRecordEntity) {
    return {
      id: record.getId(),
      prices: record.getPrices(),
      timestamp: record.getTimestamp(),
      completed: record.getCompleted(),
    };
  }
}
