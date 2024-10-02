import { Inject } from '@nestjs/common';
import QuestsProcessingModuleTokens from '@quests-processing/quests-processing.module.tokens';

const InjectQuestsIndex = () => {
  return Inject(QuestsProcessingModuleTokens.Catalogs.QuestsCatalog);
};

export default InjectQuestsIndex;
