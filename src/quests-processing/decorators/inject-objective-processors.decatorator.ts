import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectObjectiveProcessors = () => {
  return Inject(QuestsProcessingModuleTokens.ObjectiveProcessors);
};

export default InjectObjectiveProcessors;
