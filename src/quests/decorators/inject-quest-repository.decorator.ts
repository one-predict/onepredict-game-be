import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestRepository = () => {
  return Inject(QuestsModuleTokens.Repositories.QuestRepository);
};

export default InjectQuestRepository;
