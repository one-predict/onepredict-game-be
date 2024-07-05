import { IsNumber } from 'class-validator';

export class GetTournamentByDisplayIdDto {
  @IsNumber()
  tournamentDisplayId: number;
}
