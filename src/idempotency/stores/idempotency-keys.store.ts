export interface IdempotencyKeysStore {
  exists(idempotencyKey: string): Promise<boolean>;
  save(idempotencyKey: string): Promise<void>;
}
