import { IsNotEmpty, IsString, IsArray } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class CreatePortfolioDto {
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  selectedTokens: string[];

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;
}
