import { IsNotEmpty } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class ListLatestTokensOffersDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;
}
