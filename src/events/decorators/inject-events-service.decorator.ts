import { Inject } from '@nestjs/common';
import EventsModuleTokens from '@events/events.module.tokens';

const InjectEventsService = () => {
  return Inject(EventsModuleTokens.Services.EventsService);
};

export default InjectEventsService;
