import { DynamicModule, Module } from '@nestjs/common';
import { LockHostModule, LockHostModuleOptions } from './host';
import LockModuleTokens from './lock.module.tokens';

export type LockModuleOptions = LockHostModuleOptions;

@Module({
  providers: [
    {
      provide: LockModuleTokens.Services.LockService,
      useExisting: LockHostModule.LOCK_SERVICE_TOKEN,
    },
  ],
  exports: [LockModuleTokens.Services.LockService],
})
export class LockModule {
  public static Tokens = LockModuleTokens;

  public static forRoot(options: LockModuleOptions): DynamicModule {
    return {
      module: LockModule,
      imports: [LockHostModule.forRoot(options)],
    };
  }
}
