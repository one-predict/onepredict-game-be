import { Injectable } from '@nestjs/common';
import { InjectEventsService } from '@events/decorators';
import { EventsService } from '@events/services';
import { InjectTransactionsManager, TransactionsManager } from '@core';
import { InjectDeduplicationService } from '@deduplication/decorators';
import { DeduplicationService } from '@deduplication/services';
import { AnyQuestAction } from '@quests/types';
import { QuestActionType } from '@quests/enums';
import { TournamentParticipationsEventType } from '@tournament/enums';
import { generateQuestActionDetectedEvent } from '@quests-processing/utils';
import { TournamentParticipationCreatedEvent } from '@tournament/types';

export type TournamentQuestEvent = TournamentParticipationCreatedEvent;

export interface TournamentQuestActionsDetectionService {
  detect(event: TournamentQuestEvent): Promise<void>;
}

@Injectable()
export class DefaultTournamentQuestActionsDetectionService implements TournamentQuestActionsDetectionService {
  constructor(
    @InjectEventsService() private readonly eventsService: EventsService,
    @InjectTransactionsManager() private readonly transactionsManager: TransactionsManager,
    @InjectDeduplicationService() private readonly deduplicationService: DeduplicationService,
  ) {}

  public async detect(event: TournamentQuestEvent) {
    const actions: AnyQuestAction[] = [];

    if (event.type === TournamentParticipationsEventType.TournamentParticipationCreated) {
      actions.push({
        tournamentId: event.data.object.tournamentId,
        type: QuestActionType.TournamentJoined,
      });
    }

    if (actions.length === 0) {
      return;
    }

    await this.transactionsManager.useTransaction(async () => {
      await this.deduplicationService.createDeduplicationRecord(`tournament-quest-actions-detection:${event.id}`);

      await this.eventsService.batchCreate({
        batch: actions.map((action) => {
          return generateQuestActionDetectedEvent(action, event.data.object.userId);
        }),
      });
    });
  }
}
