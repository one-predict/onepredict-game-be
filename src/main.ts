import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import { ConfigService } from '@nestjs/config';
import { Buffer } from 'buffer';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const configService: ConfigService = app.get(ConfigService);

  await app.register(secureSession, {
    key: Buffer.from(configService.getOrThrow<string>('SESSIONS_SECRET'), 'hex'),
    expiry: parseInt(configService.getOrThrow<string>('SESSIONS_EXPIRY')),
    cookie: {
      path: '/',
      httpOnly: true,
      secure: true,
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(configService.getOrThrow<string>('PORT'), '0.0.0.0');
}

bootstrap();
