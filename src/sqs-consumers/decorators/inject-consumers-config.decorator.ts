import { Inject } from '@nestjs/common';
import SqsConsumersModuleTokens from '@sqs-consumers/sqs-consumers.module.tokens';

const InjectConsumersConfig = () => {
  return Inject(SqsConsumersModuleTokens.ConsumersConfig);
};

export default InjectConsumersConfig;
