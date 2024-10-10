import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionGameRoundService = () => {
  return Inject(PredictionGameModuleTokens.Services.PredictionGameRoundService);
};

export default InjectPredictionGameRoundService;
