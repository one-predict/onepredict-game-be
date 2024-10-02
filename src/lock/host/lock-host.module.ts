import { DynamicModule, Global, Module, ModuleMetadata } from '@nestjs/common';

export interface LockHostModuleOptions extends Pick<ModuleMetadata, 'imports'> {
  useExistingLockService: unknown;
}

const LOCK_SERVICE_TOKEN = Symbol('LOCK_SERVICE_TOKEN');

@Global()
@Module({})
export class LockHostModule {
  public static LOCK_SERVICE_TOKEN = LOCK_SERVICE_TOKEN;

  public static forRoot(options: LockHostModuleOptions): DynamicModule {
    return {
      module: LockHostModule,
      imports: options.imports,
      providers: [
        {
          provide: LOCK_SERVICE_TOKEN,
          useExisting: options.useExistingLockService,
        },
      ],
      exports: [LOCK_SERVICE_TOKEN],
    };
  }
}
