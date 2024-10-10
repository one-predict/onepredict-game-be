import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionStreakRepository = () => {
  return Inject(PredictionGameModuleTokens.Repositories.PredictionStreakRepository);
};

export default InjectPredictionStreakRepository;
