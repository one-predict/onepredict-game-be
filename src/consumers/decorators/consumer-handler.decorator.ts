import { SetMetadata } from '@nestjs/common';
import { CONSUMER_METHOD_METADATA_KEY } from '@consumers/constants';

export interface ConsumerHandlerOptions {
  disableIdempotency?: boolean;
  idempotencyLockDuration?: number;
}

const ConsumerHandler = (name: string, options?: ConsumerHandlerOptions) => {
  return SetMetadata(CONSUMER_METHOD_METADATA_KEY, { name, options });
};

export default ConsumerHandler;
