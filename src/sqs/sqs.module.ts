import { DynamicModule, Module } from '@nestjs/common';
import { SqsHostModule, RootSqsHostAsyncModuleOptions } from './host';
import { getSqsClientToken } from './utils';

export type RootSqsAsyncModuleOptions = RootSqsHostAsyncModuleOptions;

@Module({})
export class SqsModule {
  public static getSqsClientToken = getSqsClientToken;

  public static register(clientName?: string): DynamicModule {
    return {
      module: SqsModule,
      providers: [
        {
          provide: getSqsClientToken(clientName),
          useExisting: SqsHostModule.getSqsClientToken(clientName),
        },
      ],
      exports: [getSqsClientToken(clientName)],
    };
  }

  public static forRootAsync(options: RootSqsAsyncModuleOptions): DynamicModule {
    return {
      module: SqsModule,
      imports: [SqsHostModule.forRootAsync(options)],
    };
  }
}
