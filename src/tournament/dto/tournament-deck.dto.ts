import { IsNotEmpty, IsOptional } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';
import { IsCardsStack } from '@card';

export class ListMyTournamentDecksDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;
}

export class UpdateTournamentDeckDto {
  @IsOptional()
  @IsCardsStack()
  cardsStack?: Record<string, number>;
}
