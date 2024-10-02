import { Module } from '@nestjs/common';
import { PublishersModule } from '@publishers';
import { CoreModule } from '@core';
import EventsModuleTokens from './events.module.tokens';
import { DefaultEventsService } from './services';

@Module({
  imports: [PublishersModule.register('events'), CoreModule],
  controllers: [],
  providers: [
    {
      provide: EventsModuleTokens.Services.EventsService,
      useClass: DefaultEventsService,
    },
  ],
  exports: [EventsModuleTokens.Services.EventsService],
})
export class EventsModule {}
