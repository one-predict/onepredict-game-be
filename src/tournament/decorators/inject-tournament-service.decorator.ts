import { Inject } from '@nestjs/common';
import TournamentModuleTokens from '@tournament/tournament.module.tokens';

const InjectTournamentService = () => {
  return Inject(TournamentModuleTokens.Services.TournamentService);
};

export default InjectTournamentService;
