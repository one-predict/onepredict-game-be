import { Inject } from '@nestjs/common';
import TournamentModuleTokens from '@tournament/tournament.module.tokens';

const InjectTournamentParticipationService = () => {
  return Inject(TournamentModuleTokens.Services.TournamentParticipationService);
};

export default InjectTournamentParticipationService;
