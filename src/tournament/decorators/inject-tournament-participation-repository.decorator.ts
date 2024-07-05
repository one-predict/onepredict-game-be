import { Inject } from '@nestjs/common';
import TournamentModuleTokens from '@tournament/tournament.module.tokens';

const InjectTournamentParticipationRepository = () => {
  return Inject(TournamentModuleTokens.Repositories.TournamentParticipationRepository);
};

export default InjectTournamentParticipationRepository;
