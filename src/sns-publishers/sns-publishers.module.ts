import { DynamicModule, InjectionToken, Module, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common';
import { SnsModule } from '@sns';
import { SnsMessagePublisherService } from './services';
import { SnsPublishersConfig } from './types';
import SnsPublishersModuleTokens from './sns-publishers.module.tokens';

export interface RegisterAsyncSnsPublishersModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: unknown[]) => Promise<SnsPublishersConfig> | SnsPublishersConfig;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

@Module({})
export class SnsPublishersModule {
  public static Tokens = SnsPublishersModuleTokens;

  public static registerAsync(options: RegisterAsyncSnsPublishersModuleOptions): DynamicModule {
    return {
      module: SnsPublishersModule,
      imports: [SnsModule.register(), ...options.imports],
      providers: [
        {
          provide: SnsPublishersModuleTokens.Services.SnsMessagePublisherService,
          useClass: SnsMessagePublisherService,
        },
        {
          provide: SnsPublishersModuleTokens.Configs.SnsPublishersConfig,
          useFactory: options.useFactory,
          inject: options.inject,
        },
      ],
      exports: [SnsPublishersModuleTokens.Services.SnsMessagePublisherService],
    };
  }
}
