import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectObjectiveTagsExtractorFactory = () => {
  return Inject(QuestsProcessingModuleTokens.Factories.ObjectiveTagsExtractorFactory);
};

export default InjectObjectiveTagsExtractorFactory;
