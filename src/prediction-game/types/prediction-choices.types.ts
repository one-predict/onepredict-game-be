import { DigitalAssetPricePredictionSummary } from './digital-asset-price-prediction.types';

export type PredictionSummaries = Record<string, DigitalAssetPricePredictionSummary>;

export interface PredictionChoiceResult {
  predictionSummaries: PredictionSummaries;
  earnedCoins: number;
}
