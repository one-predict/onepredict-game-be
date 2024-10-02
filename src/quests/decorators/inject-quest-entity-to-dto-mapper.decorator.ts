import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestEntityToDtoMapper = () => {
  return Inject(QuestsModuleTokens.EntityToDtoMappers.QuestEntityToDtoMapper);
};

export default InjectQuestEntityToDtoMapper;
