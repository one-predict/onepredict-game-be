import { Module } from '@nestjs/common';
import { RedisLockService } from './services';
import RedisLockModuleTokens from './redis-lock.module.tokens';

@Module({
  providers: [
    {
      provide: RedisLockModuleTokens.Services.RedisLockService,
      useClass: RedisLockService,
    },
  ],
  exports: [RedisLockModuleTokens.Services.RedisLockService],
})
export class RedisLockModule {
  public static Tokens = RedisLockModuleTokens;
}
