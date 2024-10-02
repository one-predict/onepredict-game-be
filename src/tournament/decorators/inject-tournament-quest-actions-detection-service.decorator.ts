import { Inject } from '@nestjs/common';
import TournamentModuleTokens from '@tournament/tournament.module.tokens';

const InjectTournamentQuestActionsDetectionConsumer = () => {
  return Inject(TournamentModuleTokens.Services.TournamentQuestActionsDetectionService);
};

export default InjectTournamentQuestActionsDetectionConsumer;
