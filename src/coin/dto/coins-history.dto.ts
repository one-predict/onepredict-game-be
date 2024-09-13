import { IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { CoinsHistoricalRecordsPeriod } from '@coin/enums';

export class ListLatestCompletedCoinsHistoryDto {
  @Transform(({ value }) => parseInt(value))
  @IsIn([CoinsHistoricalRecordsPeriod.TwentyFourHours])
  period: number;
}
