import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { RewardsNotification, RewardsNotificationSchema } from './schemas';
import { DefaultRewardsNotificationService } from './services';
import { RewardsNotificationController } from './controllers';
import { MongoRewardsNotificationRepository } from './repositories';
import RewardsModuleTokens from './rewards.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RewardsNotification.name, schema: RewardsNotificationSchema }]),
    CoreModule,
  ],
  controllers: [RewardsNotificationController],
  providers: [
    {
      provide: RewardsModuleTokens.Services.RewardsNotificationService,
      useClass: DefaultRewardsNotificationService,
    },
    {
      provide: RewardsModuleTokens.Repositories.RewardsNotificationRepository,
      useClass: MongoRewardsNotificationRepository,
    },
  ],
  exports: [RewardsModuleTokens.Services.RewardsNotificationService],
})
export class RewardsModule {}
