import { Inject } from '@nestjs/common';
import CoreModuleTokens from '@core/core.module.tokens';

const InjectTransactionsManagerDecorator = () => {
  return Inject(CoreModuleTokens.Managers.TransactionsManager);
};

export default InjectTransactionsManagerDecorator;
