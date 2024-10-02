import { DynamicModule, Module } from '@nestjs/common';
import { SnsHostModule, RootSnsHostAsyncModuleOptions } from './host';
import { getSnsClientToken } from './utils';

export type RootSnsAsyncModuleOptions = RootSnsHostAsyncModuleOptions;

@Module({})
export class SnsModule {
  public static getSnsClientToken = getSnsClientToken;

  public static register(clientName?: string): DynamicModule {
    return {
      module: SnsModule,
      providers: [
        {
          provide: getSnsClientToken(clientName),
          useExisting: SnsHostModule.getSnsClientToken(clientName),
        },
      ],
      exports: [getSnsClientToken(clientName)],
    };
  }

  public static forRootAsync(options: RootSnsAsyncModuleOptions): DynamicModule {
    return {
      module: SnsModule,
      imports: [SnsHostModule.forRootAsync(options)],
    };
  }
}
