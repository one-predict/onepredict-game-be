import * as Joi from 'joi';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@app/auth';
import { UserModule } from '@app/user';
import { CoreModule } from '@app/core';
import { PortfolioModule } from '@app/portfolio';
import { LoggerMiddleware } from '@common/middlewares';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    UserModule,
    PortfolioModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().port().default(3000),
        DATABASE_CONNECTION_URL: Joi.string().required(),
        APPLICATION_ORIGIN: Joi.string().required(),
        AUTH_DOMAIN: Joi.string().required(),
        COOKIE_DOMAIN: Joi.string().required(),
        SESSIONS_SECRET: Joi.string().required(),
        SESSIONS_MAX_AGE: Joi.number().default(86400),
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
