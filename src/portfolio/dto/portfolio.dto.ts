import { IsNotEmpty, IsArray, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsIdentifier } from '@common/class-validators';
import { IsDigitalAssetPricePrediction } from '@prediction-game/class-validators';
import { DigitalAssetPricePrediction } from '@prediction-game/types';

export class ListPortfoliosDto {
  @IsArray()
  @IsIdentifier({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  offerIds: string[];
}

export class CreatePortfolioDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(6)
  @IsDigitalAssetPricePrediction({ each: true })
  predictions: DigitalAssetPricePrediction[];

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;

  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;
}
