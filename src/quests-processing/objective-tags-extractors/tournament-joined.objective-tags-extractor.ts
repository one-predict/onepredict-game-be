import { Injectable } from '@nestjs/common';
import { TournamentJoinedQuestAction } from '@quests/types';
import { ObjectiveTagsExtractor } from './objective-tags-extractor';

@Injectable()
export default class TournamentJoinedObjectiveTagsExtractor
  implements ObjectiveTagsExtractor<TournamentJoinedQuestAction>
{
  public extract(action: TournamentJoinedQuestAction) {
    return [`join-tournament:${action.tournamentId}`, 'join-tournament'];
  }
}
