import { Injectable } from '@nestjs/common';
import { ConsumerMessage } from '@consumers/types';
import { ConsumerHandler } from '@consumers/decorators';
import { InjectQuestObjectiveProcessingService } from '@quests-processing/decorators';
import { QuestObjectiveProcessingService } from '@quests-processing/services';
import { ObjectiveTriggeredEvent } from '@quests-processing/types';
import { QuestProcessingConsumerName } from '@quests-processing/enums';

@Injectable()
export default class QuestObjectiveProcessingConsumer {
  constructor(
    @InjectQuestObjectiveProcessingService()
    private readonly questObjectiveProcessingService: QuestObjectiveProcessingService,
  ) {}

  @ConsumerHandler(QuestProcessingConsumerName.QuestObjectiveProcessing, { disableIdempotency: true })
  public async handleMessage(message: ConsumerMessage<ObjectiveTriggeredEvent>) {
    const { payload: event, deduplicationId } = message;

    await this.questObjectiveProcessingService.process({
      questId: event.data.objectiveQuestId,
      userId: event.data.userId,
      action: event.data.triggerAction,
      processingId: deduplicationId,
    });
  }
}
