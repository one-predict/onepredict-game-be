import { Inject } from '@nestjs/common';
import IdempotencyModuleTokens from '@idempotency/idempotency.module.tokens';

const InjectIdempotencyKeysStore = () => {
  return Inject(IdempotencyModuleTokens.Stores.IdempotencyKeysStore);
};

export default InjectIdempotencyKeysStore;
