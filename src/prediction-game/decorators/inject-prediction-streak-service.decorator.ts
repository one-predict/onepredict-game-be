import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionStreakService = () => {
  return Inject(PredictionGameModuleTokens.Services.PredictionStreakService);
};

export default InjectPredictionStreakService;
