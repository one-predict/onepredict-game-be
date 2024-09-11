import { Controller, Session, Get, Post, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { UserService } from '@user/services';
import { InjectUserService } from '@user/decorators';
import { UserEntity } from '@user/entities';

@Controller()
export default class UserController {
  constructor(@InjectUserService() private readonly userService: UserService) {}

  @Get('/users/current-user')
  public async getCurrentUser(@Session() session: secureSession.Session) {
    const userId = session.get('userId');

    if (!userId) {
      return { user: null };
    }

    const user = await this.userService.getById(userId);

    return {
      user: user && this.mapUserEntityToViewModel(user),
    };
  }

  @Post('/users/current-user/onboard')
  @UseGuards(AuthGuard)
  public async finishUserOnboarding(@Session() session: secureSession.Session) {
    await this.userService.update(session.get('userId'), {
      onboarded: true,
    });

    return { success: true };
  }

  private mapUserEntityToViewModel(user: UserEntity) {
    return {
      id: user.getId(),
      externalId: user.getExternalId(),
      externalType: user.getExternalType(),
      username: user.getUsername(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      avatarUrl: user.getAvatarUrl(),
      coinsBalance: user.getCoinsBalance(),
      onboarded: user.getIsOnboarded(),
      referer: user.getReferer(),
    };
  }
}
