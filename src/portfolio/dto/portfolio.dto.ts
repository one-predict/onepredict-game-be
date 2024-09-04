import { IsNotEmpty, IsArray, ArrayMaxSize } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';
import { IsPortfolioSelectedToken } from '@portfolio/class-validators';
import { SelectedPortfolioToken } from '@portfolio/schemas';
import { IsCardsStack } from '@card';

export class ListPortfoliosDto {
  @IsArray()
  @IsIdentifier({ each: true })
  offerIds: string[];
}

export class CreatePortfolioDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(6)
  @IsPortfolioSelectedToken({ each: true })
  selectedTokens: SelectedPortfolioToken[];

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;
}

export class ApplyCardsToPortfolioDto {
  @IsCardsStack()
  cardsStack: Record<string, number>;
}
