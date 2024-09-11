import { Controller, Session, Get } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { ReferralService } from '@user/services';
import { InjectReferralService } from '@user/decorators';
import { UserEntity } from '@user/entities';

@Controller()
export default class ReferralController {
  constructor(@InjectReferralService() private readonly referralService: ReferralService) {}

  @Get('/referrals/my')
  public async getCurrentUserReferrals(@Session() session: secureSession.Session) {
    const userId = session.get('userId');

    const referrals = await this.referralService.list(userId);

    return referrals.map((referral) => this.mapUserEntityToViewModel(referral));
  }

  private mapUserEntityToViewModel(user: UserEntity) {
    return {
      id: user.getId(),
      username: user.getUsername(),
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      avatarUrl: user.getAvatarUrl(),
      coinsBalance: user.getCoinsBalance(),
    };
  }
}
