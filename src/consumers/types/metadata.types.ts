export interface ConsumerMetadata {
  name: string;
  disableIdempotency?: boolean;
  idempotencyLockDuration?: number;
}
