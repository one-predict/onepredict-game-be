import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestVerificationService = () => {
  return Inject(QuestsModuleTokens.Services.QuestVerificationService);
};

export default InjectQuestVerificationService;
