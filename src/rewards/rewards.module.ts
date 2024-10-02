import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoreModule } from '@core';
import { UserModule } from '@user';
import { DeduplicationModule } from '@deduplication';
import { RewardsNotification, RewardsNotificationSchema } from './schemas';
import { DefaultRewardingService, DefaultRewardsNotificationService } from './services';
import { RewardsNotificationController } from './controllers';
import { MongoRewardsNotificationRepository } from './repositories';
import { RewardingConsumer } from './consumers';
import RewardsModuleTokens from './rewards.module.tokens';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RewardsNotification.name, schema: RewardsNotificationSchema }]),
    CoreModule,
    UserModule,
    DeduplicationModule,
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
    {
      provide: RewardsModuleTokens.Services.RewardingService,
      useClass: DefaultRewardingService,
    },
    {
      provide: RewardingConsumer,
      useClass: RewardingConsumer,
    },
  ],
  exports: [RewardsModuleTokens.Services.RewardsNotificationService],
})
export class RewardsModule {}
