import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { GameCardId } from '@card';

export class PurchaseGameCardDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(Object.values(GameCardId))
  cardId: GameCardId;
}
