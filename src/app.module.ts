import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@app/auth';
import { UserModule } from '@app/user';
import { PortfolioModule } from '@app/portfolio';
import { LoggerMiddleware } from '@common/middlewares';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PortfolioModule,
    ConfigModule.forRoot(),
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
