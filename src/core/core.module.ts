import { Module } from '@nestjs/common';
import { HealthController } from '@core/controllers';

@Module({
  controllers: [HealthController],
})
export class CoreModule {}
