import { DynamicModule, Global, Module, ModuleMetadata, Provider } from '@nestjs/common';
import { getMessagePublisherServiceToken } from './utils';

export interface PublishersHostModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  publisherNames?: string[];
  useExistingPublisherService: unknown;
}

@Global()
@Module({})
export class PublishersHostModule {
  public static getMessagePublisherServiceToken = getMessagePublisherServiceToken;

  static forRoot(options: PublishersHostModuleOptions): DynamicModule {
    const { providers, exports } = (options.publisherNames || []).reduce(
      (aggregation, publisherName) => {
        aggregation.providers.push({
          provide: getMessagePublisherServiceToken(publisherName),
          useExisting: options.useExistingPublisherService,
        });

        aggregation.exports.push(getMessagePublisherServiceToken(publisherName));

        return aggregation;
      },
      {
        providers: [] as Provider[],
        exports: [] as string[],
      },
    );

    return {
      module: PublishersHostModule,
      imports: options.imports,
      providers: options.publisherNames
        ? providers
        : [
            {
              provide: getMessagePublisherServiceToken(),
              useExisting: options.useExistingPublisherService,
            },
          ],
      exports: options.publisherNames ? exports : [getMessagePublisherServiceToken()],
    };
  }
}
