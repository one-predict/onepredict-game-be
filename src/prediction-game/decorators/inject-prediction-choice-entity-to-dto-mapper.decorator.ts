import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionChoiceEntityToDtoMapper = () => {
  return Inject(PredictionGameModuleTokens.EntityToDtoMappers.PredictionChoiceEntityToDtoMapper);
};

export default InjectPredictionChoiceEntityToDtoMapper;
