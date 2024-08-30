import { IsNotEmpty, IsIn, IsArray, ArrayMaxSize } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';
import { GameCardId } from '@card';

export class ListMyTournamentDecksDto {
  @IsNotEmpty()
  @IsIdentifier()
  tournamentId: string;
}

export class UpdateTournamentDeckDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsIn(Object.values(GameCardId), { each: true })
  cardIds?: GameCardId[];
}
