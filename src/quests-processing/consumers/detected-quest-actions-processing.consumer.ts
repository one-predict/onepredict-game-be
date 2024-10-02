import { Injectable } from '@nestjs/common';
import { ConsumerMessage } from '@consumers/types';
import { ConsumerHandler } from '@consumers/decorators';
import { InjectDetectedQuestActionsProcessingService } from '@quests-processing/decorators';
import { DetectedQuestActionsProcessingService } from '@quests-processing/services';
import { QuestActionDetectedEvent } from '@quests-processing/types';
import { QuestProcessingConsumerName } from '@quests-processing/enums';

@Injectable()
export default class DetectedQuestActionsProcessingConsumer {
  constructor(
    @InjectDetectedQuestActionsProcessingService()
    private readonly detectedQuestActionsProcessingService: DetectedQuestActionsProcessingService,
  ) {}

  @ConsumerHandler(QuestProcessingConsumerName.DetectedQuestActionsProcessing)
  public async handleMessage(message: ConsumerMessage<QuestActionDetectedEvent>) {
    const { payload: event, deduplicationId } = message;

    await this.detectedQuestActionsProcessingService.process({
      action: event.data.action,
      userId: event.data.userId,
      detectionId: deduplicationId,
    });
  }
}
