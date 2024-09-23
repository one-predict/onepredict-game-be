import { Controller, Session, Get, UseGuards, Param, Delete } from '@nestjs/common';
import * as secureSession from '@fastify/secure-session';
import { AuthGuard } from '@common/guards';
import { RewardsNotificationService } from '@rewards/services';
import { RewardsNotificationEntity } from '@rewards/entities';
import { InjectRewardsNotificationService } from '@rewards/decorators';

@Controller()
export default class RewardsNotificationController {
  constructor(
    @InjectRewardsNotificationService() private readonly rewardsNotificationService: RewardsNotificationService,
  ) {}

  @Get('/rewards-notifications/my')
  @UseGuards(AuthGuard)
  public async listMyNotifications(@Session() session: secureSession.Session) {
    const userId = session.get('userId');

    const rewardsNotifications = await this.rewardsNotificationService.listByRecipientId(userId);

    return rewardsNotifications.map((rewardsNotification) => {
      return this.mapRewardsNotificationEntityToViewModel(rewardsNotification);
    });
  }

  @Delete('/rewards-notifications/:id')
  @UseGuards(AuthGuard)
  public async acknowledgeNotification(@Session() session: secureSession.Session, @Param('id') id: string) {
    const userId = session.get('userId');

    await this.rewardsNotificationService.delete(id, userId);

    return { success: true };
  }

  private mapRewardsNotificationEntityToViewModel(notification: RewardsNotificationEntity) {
    return {
      id: notification.getId(),
      recipientId: notification.getRecipientId(),
      type: notification.getType(),
      payload: notification.getPayload(),
    };
  }
}
