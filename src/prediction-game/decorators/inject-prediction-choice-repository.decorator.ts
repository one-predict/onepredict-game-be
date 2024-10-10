import { Inject } from '@nestjs/common';
import PredictionGameModuleTokens from '@prediction-game/prediction-game.module.tokens';

const InjectPredictionChoiceRepository = () => {
  return Inject(PredictionGameModuleTokens.Repositories.PredictionChoiceRepository);
};

export default InjectPredictionChoiceRepository;
