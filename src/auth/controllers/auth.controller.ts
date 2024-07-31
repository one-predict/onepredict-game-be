import { Controller, Post, Session, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthService } from '@auth/services';
import { InjectAuthService } from '@auth/decorators';
import { SignInDto } from '@auth/dto';

declare module '@fastify/secure-session' {
  interface SessionData {
    userId: string;
    externalId: string | number;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  }
}

@Controller()
export default class AuthController {
  constructor(@InjectAuthService() private readonly authService: AuthService) {}

  @Post('/auth/sign-in')
  public async signIn(@Session() session: secureSession.Session, @Body() body: SignInDto) {
    const user = await this.authService.signTelegramUser(body.signInMessage);

    session.set('userId', user.getId());
    session.set('externalId', user.getExternalId());
    session.set('username', user.getUsername());
    session.set('firstName', user.getFirstName());
    session.set('lastName', user.getLastName());
    session.set('avatarUrl', user.getAvatarUrl());

    return { success: true };
  }
}
