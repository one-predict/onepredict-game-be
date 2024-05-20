import { Module } from '@nestjs/common';
import { HealthController } from '@core/controllers';
import CoreModuleTokens from '@core/core.module.tokens';
import { MongodbTransactionsManager } from '@core/managers';
import { AsyncLocalStorage } from 'async_hooks';

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
