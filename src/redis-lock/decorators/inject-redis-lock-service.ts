import { Inject } from '@nestjs/common';
import RedisLockModuleTokens from '@redis-lock/redis-lock.module.tokens';

const InjectRedisLockService = () => {
  return Inject(RedisLockModuleTokens.Services.RedisLockService);
};

export default InjectRedisLockService;
