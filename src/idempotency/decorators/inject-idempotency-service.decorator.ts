import { Inject } from '@nestjs/common';
import IdempotencyModuleTokens from '@idempotency/idempotency.module.tokens';

const InjectIdempotencyService = () => {
  return Inject(IdempotencyModuleTokens.Services.IdempotencyService);
};

export default InjectIdempotencyService;
