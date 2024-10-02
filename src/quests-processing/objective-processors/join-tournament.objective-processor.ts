import { Injectable } from '@nestjs/common';
import {
  TournamentJoinedQuestAction,
  JoinTournamentObjective,
  JoinTournamentObjectiveProcessingState,
} from '@quests/types';
import { ObjectiveProcessor } from './objective-processor';

@Injectable()
export default class JoinTournamentObjectiveProcessor
  implements
    ObjectiveProcessor<JoinTournamentObjectiveProcessingState, TournamentJoinedQuestAction, JoinTournamentObjective>
{
  public async process(state: JoinTournamentObjectiveProcessingState | null, action: TournamentJoinedQuestAction) {
    return {
      completed: true,
      nextState: {
        tournamentId: action.tournamentId,
      },
    };
  }
}
