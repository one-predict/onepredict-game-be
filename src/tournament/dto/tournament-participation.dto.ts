import { IsNotEmpty } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class CreateTournamentParticipationDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;
}
