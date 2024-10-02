import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestService = () => {
  return Inject(QuestsModuleTokens.Services.QuestService);
};

export default InjectQuestService;
