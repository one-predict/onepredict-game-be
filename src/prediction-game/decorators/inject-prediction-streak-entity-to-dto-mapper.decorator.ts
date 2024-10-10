import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionStreakEntityToDtoMapper = () => {
  return Inject(PredictionGameModuleTokens.EntityToDtoMappers.PredictionStreakEntityToDtoMapper);
};

export default InjectPredictionStreakEntityToDtoMapper;
