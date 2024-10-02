import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { IdempotencyModule } from '@idempotency';
import { DefaultConsumersRegistry } from './consumers.registry';
import ConsumersModuleTokens from './consumers.module.tokens';

@Module({
  imports: [IdempotencyModule, DiscoveryModule, ConfigModule],
  providers: [
    {
      provide: ConsumersModuleTokens.ConsumersRegistry,
      useClass: DefaultConsumersRegistry,
    },
  ],
  exports: [ConsumersModuleTokens.ConsumersRegistry],
})
export class ConsumersModule {
  public static Tokens = ConsumersModuleTokens;
}
