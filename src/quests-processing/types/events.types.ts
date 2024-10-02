import { Event } from '@events/types';
import { AnyQuestAction } from '@quests/types';
import { QuestsProcessingEventType } from '@quests-processing/enums';

export interface ObjectiveTriggeredEventData {
  objectiveQuestId: string;
  userId: string;
  triggerAction: AnyQuestAction;
}

export interface QuestActionDetectedEventData {
  userId: string;
  action: AnyQuestAction;
}

export type ObjectiveTriggeredEvent = Event<
  QuestsProcessingEventType.QuestObjectiveTriggered,
  ObjectiveTriggeredEventData
>;

export type QuestActionDetectedEvent = Event<
  QuestsProcessingEventType.QuestActionDetected,
  QuestActionDetectedEventData
>;
