import { IsNotEmpty } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class CreateTournamentParticipationDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;
}

export class GetUserParticipationForTournamentDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;

  @IsNotEmpty()
  @IsIdentifier()
  userId: string;
}

export class GetUserRankForTournamentDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;

  @IsNotEmpty()
  @IsIdentifier()
  userId: string;
}

export class CreateTournamentParticipationForUserDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;

  @IsNotEmpty()
  @IsIdentifier()
  userId: string;
}
