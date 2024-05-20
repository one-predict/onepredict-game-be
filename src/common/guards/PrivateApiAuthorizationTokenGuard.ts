import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class PrivateApiAuthorizationTokenGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  public canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers['authorization'];
    const [, token] = authorization.split(' ');

    return this.configService.getOrThrow('PRIVATE_API_AUTHORIZATION_SECRET') === token;
  }
}
