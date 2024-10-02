import { Injectable } from '@nestjs/common';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { MessagePublisherService, PublishMessageParams } from '@publishers/services';
import { InjectSnsClient } from '@sns/decorators';
import { InjectSnsPublishersConfig } from '@sns-publishers/decorators';
import { SnsPublishersConfig } from '@sns-publishers/types';
import { MessageAttributeValue } from '@aws-sdk/client-sns/dist-types/models/models_0';

@Injectable()
export class SnsMessagePublisherService implements MessagePublisherService {
  constructor(
    @InjectSnsClient() private snsClient: SNSClient,
    @InjectSnsPublishersConfig() private config: SnsPublishersConfig,
  ) {}

  public async publish(params: PublishMessageParams) {
    const publisherConfig = this.config[params.publishKey];

    if (!publisherConfig) {
      throw new Error(`Publisher for "${params.publishKey}" key is not found`);
    }

    const customMessageAttributes = Object.keys(params.messageAttributes || {}).reduce(
      (previousCustomMessageAttributes, key) => {
        previousCustomMessageAttributes[key] = {
          DataType: 'String',
          StringValue: (params.messageAttributes || {})[key],
        };

        return previousCustomMessageAttributes;
      },
      {} as Record<string, MessageAttributeValue>,
    );

    const command = new PublishCommand({
      TopicArn: publisherConfig.topicArn,
      Message: JSON.stringify(params.data),
      MessageAttributes: {
        ...customMessageAttributes,
        ...(params.deduplicationId
          ? { DeduplicationId: { DataType: 'String', StringValue: params.deduplicationId } }
          : {}),
        ...(params.correlationId
          ? {
              CorrelationId: {
                DataType: 'String',
                StringValue: params.correlationId,
              },
            }
          : {}),
      },
    });

    await this.snsClient.send(command);
  }
}
