import { Inject } from '@nestjs/common';
import DeduplicationModuleTokens from '@deduplication/deduplication.module.tokens';

const InjectDeduplicationService = () => {
  return Inject(DeduplicationModuleTokens.Services.DeduplicationService);
};

export default InjectDeduplicationService;
