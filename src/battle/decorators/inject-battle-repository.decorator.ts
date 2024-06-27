import { Inject } from '@nestjs/common';
import BattleModuleTokens from '../battle.module.tokens';

const InjectBattleRepository = () => {
  return Inject(BattleModuleTokens.Repositories.BattleRepository);
};

export default InjectBattleRepository;
