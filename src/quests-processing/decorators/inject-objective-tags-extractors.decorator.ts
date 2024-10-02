import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectObjectiveTagsExtractors = () => {
  return Inject(QuestsProcessingModuleTokens.ObjectiveTagsExtractors);
};

export default InjectObjectiveTagsExtractors;
