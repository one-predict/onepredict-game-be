import { Inject } from '@nestjs/common';
import CoreModuleTokens from '@core/core.module.tokens';

const InjectTransactionsManager = () => {
  return Inject(CoreModuleTokens.Managers.TransactionsManager);
};

export default InjectTransactionsManager;
