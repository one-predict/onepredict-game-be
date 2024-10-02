import { Inject } from '@nestjs/common';
import QuestsModuleTokens from '@quests/quests.module.tokens';

const InjectQuestProgressStateEntityToDtoMapper = () => {
  return Inject(QuestsModuleTokens.EntityToDtoMappers.QuestProgressStateEntityToDtoMapper);
};

export default InjectQuestProgressStateEntityToDtoMapper;
