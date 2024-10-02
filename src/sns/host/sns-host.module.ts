import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { SNSClient, SNSClientConfig } from '@aws-sdk/client-sns';
import { getSnsClientToken } from './utils';
import SnsHostModuleTokens from './sns-host.module.tokens';

export interface RootSnsHostAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  clientName?: string;
  useConfigFactory: (...args: unknown[]) => SNSClientConfig | Promise<SNSClientConfig>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

@Global()
@Module({})
export class SnsHostModule {
  public static getSnsClientToken = getSnsClientToken;

  public static forRootAsync(options: RootSnsHostAsyncModuleOptions): DynamicModule {
    return {
      module: SnsHostModule,
      imports: options.imports,
      providers: [
        {
          provide: getSnsClientToken(options.clientName),
          useFactory: (config: SNSClientConfig) => {
            return new SNSClient(config);
          },
          inject: [SnsHostModuleTokens.SnsConfig],
        },
        {
          provide: SnsHostModuleTokens.SnsConfig,
          useFactory: options.useConfigFactory,
          inject: options.inject,
        },
      ],
      exports: [getSnsClientToken(options.clientName)],
    };
  }
}
