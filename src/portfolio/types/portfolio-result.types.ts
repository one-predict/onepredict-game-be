export interface PortfolioDigitalAssetPricePredictionSummary {
  priceChange: number;
  points: number;
}

export interface PortfolioResult {
  predictionSummaries: Record<string, PortfolioDigitalAssetPricePredictionSummary>;
  totalPoints: number;
}
