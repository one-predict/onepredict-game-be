import { Injectable } from '@nestjs/common';
import { CoinsEarnedQuestAction } from '@quests/types';
import { ObjectiveTagsExtractor } from './objective-tags-extractor';

@Injectable()
export default class CoinsEarnedObjectiveTagsExtractor implements ObjectiveTagsExtractor<CoinsEarnedQuestAction> {
  public extract() {
    return [`earn-coins`];
  }
}
