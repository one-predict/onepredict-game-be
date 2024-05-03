import { Controller, Session, Get } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { UserService } from '@user/services';
import { InjectUserService } from '@user/decorators';

@Controller()
export default class UserController {
  constructor(@InjectUserService() private readonly userService: UserService) {}

  @Get('/current-user')
  public async getCurrentUser(@Session() session: secureSession.Session) {
    const fid = session.get('fid');

    if (!fid) {
      return { user: null };
    }

    const user = await this.userService.getByFid(fid);

    return {
      user: user && {
        id: user.getId(),
        fid: user.getFid(),
        name: user.getName(),
        imageUrl: user.getImageUrl(),
        balance: user.getBalance(),
      },
    };
  }
}
