import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectQuestObjectiveProcessingService = () => {
  return Inject(QuestsProcessingModuleTokens.Services.QuestsObjectiveProcessingService);
};

export default InjectQuestObjectiveProcessingService;
