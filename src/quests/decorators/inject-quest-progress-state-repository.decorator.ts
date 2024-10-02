import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestProgressStateRepository = () => {
  return Inject(QuestsModuleTokens.Repositories.QuestProgressStateRepository);
};

export default InjectQuestProgressStateRepository;
