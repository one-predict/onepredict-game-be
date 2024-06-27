import { Inject } from '@nestjs/common';
import BattleModuleTokens from '../battle.module.tokens';

const InjectBattleService = () => {
  return Inject(BattleModuleTokens.Services.BattleService);
};

export default InjectBattleService;
