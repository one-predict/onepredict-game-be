import { Inject } from '@nestjs/common';
import TournamentModuleTokens from '@tournament/tournament.module.tokens';

const InjectTournamentDeckRepository = () => {
  return Inject(TournamentModuleTokens.Repositories.TournamentDeckRepository);
};

export default InjectTournamentDeckRepository;
