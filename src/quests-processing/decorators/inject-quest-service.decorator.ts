import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectQuestService = () => {
  return Inject(QuestsProcessingModuleTokens.Services.QuestService);
};

export default InjectQuestService;
