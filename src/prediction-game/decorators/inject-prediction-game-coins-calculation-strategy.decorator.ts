import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionGameCoinsCalculationStrategy = () => {
  return Inject(PredictionGameModuleTokens.Strategies.PredictionGameCoinsCalculationStrategy);
};

export default InjectPredictionGameCoinsCalculationStrategy;
