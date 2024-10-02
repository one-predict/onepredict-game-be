import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectObjectiveProcessorFactory = () => {
  return Inject(QuestsProcessingModuleTokens.Factories.ObjectiveProcessorFactory);
};

export default InjectObjectiveProcessorFactory;
