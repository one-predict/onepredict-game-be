import { Inject } from '@nestjs/common';
import TournamentModuleTokens from '@tournament/tournament.module.tokens';

const InjectTournamentRepository = () => {
  return Inject(TournamentModuleTokens.Repositories.TournamentRepository);
};

export default InjectTournamentRepository;
