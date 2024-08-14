import { Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { MongodbTransactionsManager } from '@core/managers';
import { HealthController } from '@core/controllers';
import CoreModuleTokens from './core.module.tokens';

@Module({
  controllers: [HealthController],
  providers: [
    {
      provide: CoreModuleTokens.Managers.TransactionsManager,
      useClass: MongodbTransactionsManager,
    },
    {
      provide: CoreModuleTokens.AsyncStorages.SessionsAsyncStorage,
      useValue: new AsyncLocalStorage<string>(),
    },
  ],
  exports: [CoreModuleTokens.Managers.TransactionsManager],
})
export class CoreModule {}
