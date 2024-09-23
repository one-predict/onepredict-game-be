import { Inject } from '@nestjs/common';
import AuthModuleTokens from '@auth/auth.module.tokens';

const InjectRegistrationService = () => {
  return Inject(AuthModuleTokens.Services.RegistrationService);
};

export default InjectRegistrationService;
