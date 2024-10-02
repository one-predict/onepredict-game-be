import { DynamicModule, Module } from '@nestjs/common';
import { PublishersHostModule, PublishersHostModuleOptions } from './host';
import { getMessagePublisherServiceToken } from './utils';

export type RootPublishersModuleOptions = PublishersHostModuleOptions;

@Module({})
export class PublishersModule {
  public static getMessagePublisherServiceToken = getMessagePublisherServiceToken;

  static register(publisherName?: string): DynamicModule {
    return {
      module: PublishersModule,
      providers: [
        {
          provide: getMessagePublisherServiceToken(publisherName),
          useExisting: PublishersHostModule.getMessagePublisherServiceToken(publisherName),
        },
      ],
      exports: [getMessagePublisherServiceToken(publisherName)],
    };
  }

  static forRoot(options: RootPublishersModuleOptions): DynamicModule {
    return {
      module: PublishersModule,
      imports: [PublishersHostModule.forRoot(options)],
    };
  }
}
