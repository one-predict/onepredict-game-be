import { IsOptional } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class ListLatestTokensOffersDto {
  @IsOptional()
  @IsIdentifier()
  tournamentId?: string | null;
}
