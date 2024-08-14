import * as Joi from 'joi';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from '@common/middlewares';
import { AuthModule } from '@auth';
import { UserModule } from '@user';
import { CoreModule } from '@core';
import { CardModule } from '@card';
import { InventoryModule } from '@inventory';
import { PortfolioModule } from '@portfolio';
import { MarketplaceModule } from '@marketplace';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UserModule,
    PortfolioModule,
    CardModule,
    InventoryModule,
    MarketplaceModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        DATABASE_CONNECTION_URL: Joi.string().required(),
        APPLICATION_ORIGIN: Joi.string().required(),
        AUTH_DOMAIN: Joi.string().required(),
        COOKIE_DOMAIN: Joi.string().optional(),
        COIN_GECKO_API_KEY: Joi.string().required(),
        COIN_GECKO_API_URL: Joi.string().required(),
        SESSIONS_SECRET: Joi.string().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().required(),
        PRIVATE_API_AUTHORIZATION_SECRET: Joi.string().required(),
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
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
