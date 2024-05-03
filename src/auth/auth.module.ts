import { Module } from '@nestjs/common';
import { AuthController } from '@auth/controllers';
import { AuthServiceImpl } from '@auth/services';
import { UserModule } from '@app/user/user.module';

import AuthModuleTokens from './auth.module.tokens';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    {
      provide: AuthModuleTokens.Services.AuthService,
      useClass: AuthServiceImpl,
    },
  ],
})
export class AuthModule {}
