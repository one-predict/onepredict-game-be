import { Inject } from '@nestjs/common';
import CoreModuleTokens from '@core/core.module.tokens';

const InjectSessionsAsyncStorage = () => {
  return Inject(CoreModuleTokens.AsyncStorages.SessionsAsyncStorage);
};

export default InjectSessionsAsyncStorage;
