import { DigitalAssetId, DigitalAssetPriceDirection } from '@digital-assets/enums';

export interface DigitalAssetPricePrediction {
  assetId: DigitalAssetId;
  priceDirection: DigitalAssetPriceDirection;
}

export interface DigitalAssetPricePredictionSummary {
  correct: boolean;
  coins: number;
}
