import { Controller, Post, Session, Body } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthService } from '@auth/services';
import { InjectAuthService } from '@auth/decorators';
import { SignInDto } from '@auth/dto';

declare module '@fastify/secure-session' {
  interface SessionData {
    userId: string;
    fid: number;
    username: string;
    image: string;
  }
}

@Controller()
export default class AuthController {
  constructor(@InjectAuthService() private readonly authService: AuthService) {}

  @Post('/auth/sign-in')
  public async signIn(@Session() session: secureSession.Session, @Body() body: SignInDto) {
    const { fid, user } = await this.authService.verifySignInMessage({
      message: body.message,
      signature: body.signature,
      nonce: body.nonce,
      username: body.username,
      pfp: body.pfp,
    });

    session.set('userId', user.getId());
    session.set('fid', fid);
    session.set('username', body.username);
    session.set('image', body.pfp);

    return { success: true };
  }
}
