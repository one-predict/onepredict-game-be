import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

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
  @IsString({ each: true })
  selectedTokens: string[];

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;
}

export class CreatePortfolioForCurrentUserDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  selectedTokens: string[];

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;
}
