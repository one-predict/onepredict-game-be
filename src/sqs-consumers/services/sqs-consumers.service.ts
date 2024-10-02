import { Message as SqsMessage } from '@aws-sdk/client-sqs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Consumer as SqsConsumer } from 'sqs-consumer';
import { ConsumersRegistry } from '@consumers/consumers.registry';
import { InjectConsumersRegistry } from '@consumers/decorators';
import { InjectConsumersConfig } from '@sqs-consumers/decorators';
import { ConsumersConfig } from '@sqs-consumers/types';

@Injectable()
export default class SqsConsumersService implements OnModuleInit {
  private CORRELATION_ID_MESSAGE_ATTRIBUTE_NAME = 'CorrelationId' as const;
  private DEDUPLICATION_ID_MESSAGE_ATTRIBUTE_NAME = 'DeduplicationId' as const;

  private readonly logger = new Logger('SqsConsumers', { timestamp: false });

  public constructor(
    @InjectConsumersConfig() public readonly config: ConsumersConfig,
    @InjectConsumersRegistry() private readonly consumersRegistry: ConsumersRegistry,
  ) {}

  public async onModuleInit(): Promise<void> {
    this.config.forEach((consumerOptions) => {
      const { name, stopOptions, ...restConsumerOptions } = consumerOptions;

      this.consumersRegistry.register(name, (handler) => {
        const consumer = SqsConsumer.create({
          ...restConsumerOptions,
          messageAttributeNames: [
            this.CORRELATION_ID_MESSAGE_ATTRIBUTE_NAME,
            this.DEDUPLICATION_ID_MESSAGE_ATTRIBUTE_NAME,
          ],
          handleMessage: async (message: SqsMessage) => {
            const messageId = message.MessageId;

            if (!messageId) {
              this.logger.log(`Message ID is not provided for consumer: ${name}`);

              throw new Error('Message ID is required');
            }

            const correlationId = message.MessageAttributes?.[this.CORRELATION_ID_MESSAGE_ATTRIBUTE_NAME]?.StringValue;
            const deduplicationId =
              message.MessageAttributes?.[this.DEDUPLICATION_ID_MESSAGE_ATTRIBUTE_NAME]?.StringValue || messageId;

            return handler({
              messageId,
              payload: JSON.parse(message.Body),
              correlationId,
              deduplicationId,
            });
          },
        });

        return {
          start: async () => consumer.start(),
          stop: async () => consumer.stop(stopOptions),
        };
      });
    });
  }
}
