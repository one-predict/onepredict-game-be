import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionChoiceService = () => {
  return Inject(PredictionGameModuleTokens.Services.PredictionChoiceService);
};

export default InjectPredictionChoiceService;
