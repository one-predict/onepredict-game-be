// This module should be imported first.
import './instrument';

import * as Joi from 'joi';
import { Redis } from 'ioredis';
import { SentryModule } from '@sentry/nestjs/setup';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { getRedisConnectionToken, RedisModule } from '@nestjs-modules/ioredis';
import { LoggerMiddleware } from '@common/middlewares';
import { ApplicationMode } from '@common/enums';
import {
  QuestProcessingConsumerName,
  QuestsProcessingCacheNamespace,
  QuestsProcessingEventCategory,
  QuestsProcessingEventType,
} from '@quests-processing/enums';
import {
  TournamentParticipationsEventType,
  TournamentsConsumerName,
  TournamentsEventCategory,
} from '@tournament/enums';
import { RewardingEventType, RewardsConsumerName, RewardsEventCategory } from '@rewards/enums';
import { AuthModule } from '@auth';
import { UserModule } from '@user';
import { CoreModule } from '@core';
import { CardModule } from '@card';
import { InventoryModule } from '@inventory';
import { PortfolioModule } from '@portfolio';
import { MarketplaceModule } from '@marketplace';
import { DigitalAssetsModule } from '@digital-assets';
import { SqsModule } from '@sqs';
import { SnsModule } from '@sns';
import { EventsModule } from '@events';
import { PublishersModule } from '@publishers';
import { SnsPublishersModule } from '@sns-publishers';
import { IdempotencyModule } from '@idempotency';
import { QuestsModule } from '@quests';
import { QuestsProcessingModule } from '@quests-processing';
import { CacheModule } from '@cache';
import { LockModule } from '@lock';
import { RedisLockModule } from '@redis-lock';
import { ConsumersModule } from '@consumers';
import { SqsConsumersModule } from '@sqs-consumers';
import { PredictionGameModule } from '@prediction-game';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        DATABASE_CONNECTION_URL: Joi.string().required(),
        APPLICATION_ORIGIN: Joi.string().required(),
        AUTH_DOMAIN: Joi.string().required(),
        COOKIE_DOMAIN: Joi.string().optional(),
        CRYPTO_COMPARE_API_KEY: Joi.string().required(),
        CRYPTO_COMPARE_API_URL: Joi.string().required(),
        SESSIONS_SECRET: Joi.string().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        SNS_BASE_ARN: Joi.string().required(),
        SQS_BASE_URL: Joi.string().required(),
        DISABLE_CONSUMERS: Joi.boolean().optional().default(false),
        APPLICATION_MODE: Joi.string().optional().default(ApplicationMode.Default),
        PREDICTION_GAME_BASE_ASSET_COINS: Joi.number().optional().default(10),
      }),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DATABASE_CONNECTION_URL'),
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: configService.getOrThrow('REDIS_URL'),
      }),
      inject: [ConfigService],
    }),
    LockModule.forRoot({
      imports: [RedisLockModule],
      useExistingLockService: RedisLockModule.Tokens.Services.RedisLockService,
    }),
    SqsModule.forRootAsync({
      imports: [ConfigModule],
      useConfigFactory: (configService: ConfigService) => {
        return {
          region: configService.getOrThrow('AWS_REGION'),
          credentials: {
            accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
          },
        };
      },
      inject: [ConfigService],
    }),
    SnsModule.forRootAsync({
      imports: [ConfigModule],
      useConfigFactory: (configService: ConfigService) => {
        return {
          region: configService.getOrThrow('AWS_REGION'),
          credentials: {
            accessKeyId: configService.getOrThrow('AWS_ACCESS_KEY_ID'),
            secretAccessKey: configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
          },
        };
      },
      inject: [ConfigService],
    }),
    PublishersModule.forRoot({
      publisherNames: ['events'],
      imports: [
        SnsPublishersModule.registerAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            const SNS_BASE_ARN = configService.get('SNS_BASE_ARN');

            const questProcessingTopicArn = `${SNS_BASE_ARN}:quests-processing`;
            const tournamentsTopicArn = `${SNS_BASE_ARN}:tournaments`;
            const rewardsTopicArn = `${SNS_BASE_ARN}:rewards`;

            return {
              [`${QuestsProcessingEventCategory.QuestsProcessing}.${QuestsProcessingEventType.QuestActionDetected}`]: {
                topicArn: questProcessingTopicArn,
              },
              [`${QuestsProcessingEventCategory.QuestsProcessing}.${QuestsProcessingEventType.QuestObjectiveTriggered}`]:
                {
                  topicArn: questProcessingTopicArn,
                },
              [`${TournamentsEventCategory.Tournaments}.${TournamentParticipationsEventType.TournamentParticipationCreated}`]:
                {
                  topicArn: tournamentsTopicArn,
                },
              [`${RewardsEventCategory.Rewards}.${RewardingEventType.RewardsIssued}`]: {
                topicArn: rewardsTopicArn,
              },
            };
          },
          inject: [ConfigService],
        }),
      ],
      useExistingPublisherService: SnsPublishersModule.Tokens.Services.SnsMessagePublisherService,
    }),
    CacheModule.forRoot({
      cacheNamespaces: [QuestsProcessingCacheNamespace.CompletedQuests],
      imports: [],
      stores: [
        {
          max: 100000,
        },
      ],
    }),
    CacheModule.forRoot({
      cacheNamespaces: [QuestsProcessingCacheNamespace.Quests],
      imports: [],
      stores: [
        {
          max: Infinity,
        },
      ],
    }),
    IdempotencyModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redis: Redis) => ({ redis }),
      inject: [getRedisConnectionToken()],
    }),
    SqsConsumersModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const sqsBaseUrl = configService.getOrThrow('SQS_BASE_URL');

        return [
          {
            name: RewardsConsumerName.RewardingConsumerName,
            queueUrl: `${sqsBaseUrl}/rewarding`,
          },
          {
            name: TournamentsConsumerName.TournamentQuestActionsDetection,
            queueUrl: `${sqsBaseUrl}/tournament-quest-actions-detection`,
          },
          {
            name: QuestProcessingConsumerName.DetectedQuestActionsProcessing,
            queueUrl: `${sqsBaseUrl}/detected-quest-actions-processing`,
          },
          {
            name: QuestProcessingConsumerName.QuestObjectiveProcessing,
            queueUrl: `${sqsBaseUrl}/quest-objective-processing`,
          },
        ];
      },
      inject: [ConfigService],
    }),
    EventsModule,
    CoreModule,
    AuthModule,
    UserModule,
    PortfolioModule,
    CardModule,
    DigitalAssetsModule,
    InventoryModule,
    MarketplaceModule,
    QuestsModule,
    QuestsProcessingModule,
    ConsumersModule,
    PredictionGameModule,
  ],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).exclude('/health').forRoutes('*');
  }
}
