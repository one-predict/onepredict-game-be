import { Controller, Get } from '@nestjs/common';

@Controller()
export default class HealthController {
  @Get('/health')
  public async signIn() {
    return { status: 'OK' };
  }
}
