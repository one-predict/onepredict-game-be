import { ConsumerMessage } from '@consumers/types';
import { ConsumerHandler } from '@consumers/decorators';
import { TournamentsConsumerName } from '@tournament/enums';
import { TournamentQuestActionsDetectionService, TournamentQuestEvent } from '@tournament/services';
import { InjectTournamentQuestActionsDetectionConsumer } from '@tournament/decorators';

export default class TournamentQuestActionsDetectionConsumer {
  constructor(
    @InjectTournamentQuestActionsDetectionConsumer()
    private readonly tournamentQuestActionsDetectionService: TournamentQuestActionsDetectionService,
  ) {}

  @ConsumerHandler(TournamentsConsumerName.TournamentQuestActionsDetection)
  public async consume(message: ConsumerMessage<TournamentQuestEvent>) {
    await this.tournamentQuestActionsDetectionService.detect(message.payload);
  }
}
