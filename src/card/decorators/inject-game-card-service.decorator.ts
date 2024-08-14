import { Inject } from '@nestjs/common';
import CardModuleTokens from '@card/card.module.tokens';

const InjectGameCardService = () => {
  return Inject(CardModuleTokens.Services.GameCardService);
};

export default InjectGameCardService;
