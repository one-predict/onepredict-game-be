import { AnyQuestAction } from '@quests/types';
import { QuestActionDetectedEventData } from '@quests-processing/types';
import { QuestsProcessingEventType, QuestsProcessingEventCategory } from '@quests-processing/enums';
import { CreateEventParams } from '@events/services';

export const generateQuestActionDetectedEvent = (
  action: AnyQuestAction,
  userId: string,
): CreateEventParams<QuestActionDetectedEventData> => {
  return {
    type: QuestsProcessingEventType.QuestActionDetected,
    category: QuestsProcessingEventCategory.QuestsProcessing,
    data: {
      userId,
      action,
    },
    userId: null,
  };
};
