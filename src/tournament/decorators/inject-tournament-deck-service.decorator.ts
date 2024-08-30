import { Inject } from '@nestjs/common';
import TournamentModuleTokens from '@tournament/tournament.module.tokens';

const InjectTournamentDeckService = () => {
  return Inject(TournamentModuleTokens.Services.TournamentDeckService);
};

export default InjectTournamentDeckService;
