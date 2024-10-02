import { Injectable } from '@nestjs/common';
import { AnyQuestAction } from '@quests/types';
import { QuestActionType } from '@quests/enums';
import { ObjectiveTagsExtractor } from '@quests-processing/objective-tags-extractors';
import { InjectObjectiveTagsExtractors } from '@quests-processing/decorators';

export interface ObjectiveTagsExtractorFactory {
  createExtractor(actionType: QuestActionType): ObjectiveTagsExtractor<AnyQuestAction>;
}

@Injectable()
export class DefaultObjectiveExtractorFactory implements ObjectiveTagsExtractorFactory {
  constructor(
    @InjectObjectiveTagsExtractors()
    private readonly extractors: Map<QuestActionType, ObjectiveTagsExtractor<AnyQuestAction>>,
  ) {}

  public createExtractor(type: QuestActionType) {
    const extractor = this.extractors.get(type);

    if (!extractor) {
      throw new Error(`No extractor registered for action type: ${type}`);
    }

    return extractor;
  }
}
