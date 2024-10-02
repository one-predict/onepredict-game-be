import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  InjectionToken,
  OptionalFactoryDependency,
} from '@nestjs/common';
import { SQSClient, SQSClientConfig } from '@aws-sdk/client-sqs';
import { getSqsClientToken } from './utils';
import SqsHostModuleTokens from './sqs-host.module.tokens';

export interface RootSqsHostAsyncModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  clientName?: string;
  useConfigFactory: (...args: unknown[]) => SQSClientConfig | Promise<SQSClientConfig>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}

@Global()
@Module({})
export class SqsHostModule {
  public static getSqsClientToken = getSqsClientToken;

  public static forRootAsync(options: RootSqsHostAsyncModuleOptions): DynamicModule {
    return {
      module: SqsHostModule,
      imports: options.imports,
      providers: [
        {
          provide: getSqsClientToken(options.clientName),
          useFactory: (config: SQSClientConfig) => {
            return new SQSClient([config]);
          },
          inject: [SqsHostModuleTokens.SqsConfig],
        },
        {
          provide: SqsHostModuleTokens.SqsConfig,
          useFactory: options.useConfigFactory,
          inject: options.inject,
        },
      ],
      exports: [getSqsClientToken(options.clientName)],
    };
  }
}
