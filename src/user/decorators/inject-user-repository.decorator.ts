import { Inject } from '@nestjs/common';
import UserModuleTokens from '@user/user.module.tokens';

const InjectUserRepository = () => {
  return Inject(UserModuleTokens.Repositories.UserRepository);
};

export default InjectUserRepository;
