export interface LockOptions {
  throwErrorIfLocked?: boolean;
}

export interface LockService {
  lock<ReturnValue>(
    resources: string[],
    callback: () => Promise<ReturnValue>,
    ttl: number,
    options?: LockOptions,
  ): Promise<ReturnValue>;
}
