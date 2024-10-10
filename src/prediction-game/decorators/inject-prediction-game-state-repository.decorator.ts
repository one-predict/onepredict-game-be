import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionGameStateRepository = () => {
  return Inject(PredictionGameModuleTokens.Repositories.PredictionGameStateRepository);
};

export default InjectPredictionGameStateRepository;
