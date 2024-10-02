import { Inject } from '@nestjs/common';
import DeduplicationModuleTokens from '@deduplication/deduplication.module.tokens';

const InjectDeduplicationRecordRepository = () => {
  return Inject(DeduplicationModuleTokens.Repositories.DeduplicationRecordRepository);
};

export default InjectDeduplicationRecordRepository;
