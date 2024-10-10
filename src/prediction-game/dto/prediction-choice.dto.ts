import { IsNumber, IsArray, ArrayMaxSize } from 'class-validator';
import { Transform } from 'class-transformer';
import { DigitalAssetPricePrediction, PredictionChoiceResult } from '@prediction-game/types';
import { IsDigitalAssetPricePrediction } from '@prediction-game/class-validators';

export class ListLatestPredictionChoicesQueryDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit: number;
}

export class SubmitPredictionChoiceBodyDto {
  @IsArray()
  @ArrayMaxSize(3)
  @IsDigitalAssetPricePrediction({ each: true })
  predictions: DigitalAssetPricePrediction[];
}

export interface PredictionChoiceDto {
  id: string;
  userId: string;
  predictions: DigitalAssetPricePrediction[];
  round: number;
  isAwarded: boolean;
  result?: PredictionChoiceResult;
}
