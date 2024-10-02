import { AnyObject } from '@common/types';
import { randomUUID } from 'crypto';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { MessagePublisherService } from '@publishers/services';
import { InjectMessagePublisherService } from '@publishers/decorators';

export interface CreateEventParams<EventData> {
  type: string;
  category?: string;
  data: EventData;
  userId: string | null;
  meta?: AnyObject;
}

export interface BatchCreateEventsParams<EventData> {
  batch: CreateEventParams<EventData>[];
}

export interface EventsService {
  create<EventData>(params: CreateEventParams<EventData>): Promise<void>;
  batchCreate<EventData>(params: BatchCreateEventsParams<EventData>): Promise<void>;
}

export class DefaultEventsService implements EventsService {
  constructor(
    @InjectTransactionsManager() private transactionsManager: TransactionsManager,
    @InjectMessagePublisherService('events') private messagePublisherService: MessagePublisherService,
  ) {}

  public async create<EventData>(params: CreateEventParams<EventData>) {
    await this.transactionsManager.useSuccessfulCommitEffect(async () => {
      const eventId = randomUUID();

      await this.messagePublisherService.publish({
        deduplicationId: eventId,
        publishKey: `${params.category}.${params.type}`,
        data: {
          id: eventId,
          type: params.type,
          category: params.category,
          data: params.data,
          meta: params.meta,
          userId: params.userId,
          createdAt: new Date(),
        },
        messageAttributes: {
          EventType: params.type,
        },
      });
    });
  }

  public async batchCreate<EventData>(params: BatchCreateEventsParams<EventData>) {
    if (!params.batch.length) {
      return;
    }

    await this.transactionsManager.useSuccessfulCommitEffect(async () => {
      await Promise.all(
        params.batch.map(async (event) => {
          const eventId = randomUUID();

          await this.messagePublisherService.publish({
            deduplicationId: eventId,
            publishKey: `${event.category}.${event.type}`,
            data: {
              id: eventId,
              type: event.type,
              category: event.category,
              data: event.data,
              meta: event.meta,
              userId: event.userId,
              createdAt: new Date(),
            },
            messageAttributes: {
              EventType: event.type,
            },
          });
        }),
      );
    });
  }
}
