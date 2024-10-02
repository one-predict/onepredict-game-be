import { LockModule } from '@lock';
import { DynamicModule, Module } from '@nestjs/common';
import { IdempotencyHostModule, RootAsyncIdempotencyHostModuleOptions } from './host';
import { DefaultIdempotencyService } from './services';
import IdempotencyModuleTokens from './idempotency.module.tokens';

export type RootAsyncIdempotencyModuleOptions = RootAsyncIdempotencyHostModuleOptions;

@Module({
  imports: [LockModule],
  providers: [
    {
      provide: IdempotencyModuleTokens.Services.IdempotencyService,
      useClass: DefaultIdempotencyService,
    },
    {
      provide: IdempotencyModuleTokens.Stores.IdempotencyKeysStore,
      useExisting: IdempotencyHostModule.IDEMPOTENCY_KEYS_STORE_TOKEN,
    },
  ],
  exports: [IdempotencyModuleTokens.Services.IdempotencyService],
})
export class IdempotencyModule {
  public static forRootAsync(options: RootAsyncIdempotencyModuleOptions): DynamicModule {
    return {
      module: IdempotencyModule,
      imports: [IdempotencyHostModule.forRootAsync(options)],
    };
  }
}
