import { DigitalAssetPricePrediction } from '@prediction-game/types';
import { DigitalAssetPriceDirection } from '@digital-assets/enums';

export const getPredictionResultsForRound = (
  predictions: DigitalAssetPricePrediction[],
  roundStartPrices: Record<string, number>,
  roundEndPrices: Record<string, number>,
) => {
  return predictions.reduce(
    (previousPredictionResults, prediction) => {
      const startRoundAssetPrice = roundStartPrices[prediction.assetId];
      const endRoundAssetPrice = roundEndPrices[prediction.assetId];

      const percentage = ((endRoundAssetPrice - startRoundAssetPrice) / startRoundAssetPrice) * 100;

      previousPredictionResults[prediction.assetId] =
        prediction.priceDirection === DigitalAssetPriceDirection.Up ? percentage >= 0 : percentage < 0;

      return previousPredictionResults;
    },
    {} as Record<string, boolean>,
  );
};
