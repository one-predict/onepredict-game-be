import { FastifyReply, FastifyRequest } from 'fastify';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export default class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  public use(request: FastifyRequest, response: FastifyReply['raw'], next: () => void) {
    const { method, ip, originalUrl } = request;

    const userAgent = request.headers['user-agent'] || '';

    response.on('finish', () => {
      const { statusCode } = response;

      const contentLength = response.getHeader('content-length');

      this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
    });

    next();
  }
}
