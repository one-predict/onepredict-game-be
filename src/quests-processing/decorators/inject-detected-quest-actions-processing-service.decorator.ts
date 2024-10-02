import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectDetectedQuestActionsProcessingService = () => {
  return Inject(QuestsProcessingModuleTokens.Services.DetectedQuestActionsProcessingService);
};

export default InjectDetectedQuestActionsProcessingService;
