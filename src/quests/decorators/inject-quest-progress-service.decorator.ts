import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestProgressService = () => {
  return Inject(QuestsModuleTokens.Services.QuestProgressService);
};

export default InjectQuestProgressService;
