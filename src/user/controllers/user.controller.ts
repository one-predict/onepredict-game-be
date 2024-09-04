import { Controller, Session, Get, Post, UseGuards } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { Referal, UserService } from '@user/services';
import { InjectUserService } from '@user/decorators';
import { UserEntity } from '@user/entities';

@Controller()
export default class UserController {
  constructor(@InjectUserService() private readonly userService: UserService) { }

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

  @Get('/users/current-user/referals')
  public async getCurrentUserReferals(@Session() session: secureSession.Session) {
    const userId = session.get('userId');

    if (!userId) {
      return { referals: [] };
    }

    const referals = await this.userService.getReferals(userId);

    return {
      referals: referals ? referals.map(referal => this.mapReferalToViewModel(referal)) : [],
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

  private mapReferalToViewModel(referal: Referal) {
    return {
      id: referal.getId(),
      externalId: referal.getExternalId(),
      externalType: referal.getExternalType(),
      username: referal.getUsername(),
      firstName: referal.getFirstName(),
      lastName: referal.getLastName(),
      avatarUrl: referal.getAvatarUrl(),
      coinsBalance: referal.getCoinsBalance(),
      onboarded: referal.getIsOnboarded(),
      referer: referal.getReferer(),
      referalsCount: referal.referalsCount ? referal.referalsCount : 0
    };
  }
}
