import { Inject } from '@nestjs/common';
import ConsumersModuleTokens from '@consumers/consumers.module.tokens';

const InjectConsumersRegistry = () => {
  return Inject(ConsumersModuleTokens.ConsumersRegistry);
};

export default InjectConsumersRegistry;
