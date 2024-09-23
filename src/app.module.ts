// This module should be imported first.
import './instrument';

import * as Joi from 'joi';
import { SentryModule } from '@sentry/nestjs/setup';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule, SchedulerRegistry } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from '@common/middlewares';
import { AuthModule } from '@auth';
import { UserModule } from '@user';
import { CoreModule } from '@core';
import { CardModule } from '@card';
import { InventoryModule } from '@inventory';
import { PortfolioModule } from '@portfolio';
import { MarketplaceModule } from '@marketplace';
import { CoinModule } from '@coin';
import { RewardsModule } from '@rewards';

@Module({
  imports: [
    SentryModule.forRoot(),
    CoreModule,
    AuthModule,
    UserModule,
    PortfolioModule,
    CardModule,
    CoinModule,
    InventoryModule,
    MarketplaceModule,
    RewardsModule,
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
        DISABLE_CRON_JOBS: Joi.boolean().optional().default(false),
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
  ],
})
export class AppModule {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private configService: ConfigService,
  ) {}

  public onApplicationBootstrap() {
    const jobs = this.schedulerRegistry.getCronJobs();

    const disableCronJobs = this.configService.get('DISABLE_CRON_JOBS');

    if (disableCronJobs) {
      for (const [, job] of jobs) {
        job.stop();
      }

      Logger.log('Cron jobs have been disabled.');
    }
  }

  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
