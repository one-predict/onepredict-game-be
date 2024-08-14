import { IsNotEmpty, IsIn, IsArray, ArrayMaxSize } from 'class-validator';
import { GameCardId } from '@card';

export class CreatePortfolioCardsDeckDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(100)
  @IsIn(Object.values(GameCardId), { each: true })
  cardIds: GameCardId[];
}

export class UpdatePortfolioCardsDeckDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsIn(Object.values(GameCardId), { each: true })
  cardIds?: GameCardId[];
}
