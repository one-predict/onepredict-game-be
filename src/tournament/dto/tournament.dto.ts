import { IsIn, IsOptional, IsString } from 'class-validator';
import { TournamentStatus } from '@tournament/enums';

export class ListLatestTournamentsDto {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(TournamentStatus))
  status?: TournamentStatus;
}

export class CreateTournamentParticipationWithWalletAddressDto {
  @IsOptional()
  @IsString()
  walletAddress: string;
}
