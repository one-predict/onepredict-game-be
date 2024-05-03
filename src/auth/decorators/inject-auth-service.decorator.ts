import { Inject } from '@nestjs/common';
import AuthModuleTokens from '@auth/auth.module.tokens';

const InjectAuthService = () => {
  return Inject(AuthModuleTokens.Services.AuthService);
};

export default InjectAuthService;
