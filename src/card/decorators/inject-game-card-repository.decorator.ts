import { Inject } from '@nestjs/common';
import CardModuleTokens from '@card/card.module.tokens';

const InjectGameCardRepository = () => {
  return Inject(CardModuleTokens.Repositories.GameCardRepository);
};

export default InjectGameCardRepository;
