import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestRewardsService = () => {
  return Inject(QuestsModuleTokens.Services.QuestRewardsService);
};

export default InjectQuestRewardsService;
