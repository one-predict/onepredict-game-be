import { DynamicModule, InjectionToken, Module, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common';
import { ConsumersModule } from '@consumers';
import { SqsModule } from '@sqs';
import { SqsConsumersService } from './services';
import { ConsumersConfig } from './types';
import SqsConsumersModuleTokens from './sqs-consumers.module.tokens';

export interface RootAsyncSqsConsumersModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: unknown[]) => Promise<ConsumersConfig> | ConsumersConfig;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

@Module({})
export class SqsConsumersModule {
  public static Tokens = SqsConsumersModuleTokens;

  public static forRootAsync(options: RootAsyncSqsConsumersModuleOptions): DynamicModule {
    return {
      module: SqsConsumersModule,
      imports: [SqsModule.register(), ConsumersModule, ...options.imports],
      providers: [
        {
          provide: SqsConsumersModuleTokens.ConsumersConfig,
          useFactory: options.useFactory,
          inject: options.inject,
        },
        {
          provide: SqsConsumersService,
          useClass: SqsConsumersService,
        },
      ],
    };
  }
}
