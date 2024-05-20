import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import secureSession from '@fastify/secure-session';
import { ConfigService } from '@nestjs/config';
import { Buffer } from 'buffer';
import { ValidationPipe } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utcPlugin from 'dayjs/plugin/utc';
import { AppModule } from './app.module';

dayjs.extend(utcPlugin);

const CORS_ACCESS_CONTROL_MAX_AGE = 172800; // 48 hours
const CORS_ALLOWED_HEADERS = [
  'content-type',
  'content-disposition',
  'accept',
  'origin',
  'referer',
  'etag',
  'if-none-match',
];

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  const configService: ConfigService = app.get(ConfigService);

  await app.register(secureSession, {
    key: Buffer.from(configService.getOrThrow<string>('SESSIONS_SECRET'), 'hex'),
    cookie: {
      domain: configService.getOrThrow<string>('COOKIE_DOMAIN'),
      httpOnly: true,
      path: '/',
      secure: true,
      maxAge: parseInt(configService.getOrThrow<string>('SESSIONS_MAX_AGE')),
      sameSite: 'none',
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  const env = configService.get<string | undefined>('NODE_ENV') || 'development';

  if (env === 'production') {
    const applicationOrigin = configService.getOrThrow<string>('APPLICATION_ORIGIN');

    app.enableCors({
      origin: applicationOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: CORS_ALLOWED_HEADERS,
      exposedHeaders: CORS_ALLOWED_HEADERS,
      maxAge: CORS_ACCESS_CONTROL_MAX_AGE,
      credentials: true,
      optionsSuccessStatus: 204,
    });
  }

  await app.listen(configService.getOrThrow<string>('PORT'), '0.0.0.0');
}

bootstrap();
