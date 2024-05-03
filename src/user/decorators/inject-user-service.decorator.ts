import { Inject } from '@nestjs/common';
import UserModuleTokens from '@user/user.module.tokens';

const InjectUserService = () => {
  return Inject(UserModuleTokens.Services.UserService);
};

export default InjectUserService;
