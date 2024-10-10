import { IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { CoinsHistoricalRecordsPeriod, DigitalAssetId } from '@digital-assets/enums';

export class ListLatestDigitalAssetsPricesSnapshotsDto {
  @Transform(({ value }) => parseInt(value))
  @IsIn([CoinsHistoricalRecordsPeriod.TwentyFourHours])
  period: number;
}

export interface DigitalAssetsPricesSnapshotDto {
  id: string;
  prices: Record<DigitalAssetId, number>;
  timestamp: number;
}
