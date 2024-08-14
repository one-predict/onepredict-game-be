import { IsNotEmpty, IsArray, ArrayMaxSize } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';
import { IsPortfolioSelectedToken } from '@portfolio/class-validators';
import { SelectedPortfolioToken } from '@portfolio/schemas';

export class ListPortfoliosDto {
  @IsIdentifier()
  userId: string;

  @IsArray()
  @IsIdentifier({ each: true })
  offerIds: string[];
}

export class CreatePortfolioDto {
  @IsNotEmpty()
  @IsIdentifier()
  userId: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(6)
  @IsPortfolioSelectedToken({ each: true })
  selectedTokens: SelectedPortfolioToken[];

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;
}

export class CreatePortfolioForCurrentUserDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(6)
  @IsPortfolioSelectedToken({ each: true })
  selectedTokens: SelectedPortfolioToken[];

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;
}
