import { IsArray, IsIn, IsString } from 'class-validator';
import { GameCardId } from '@card/enums';

export class ListGameCardsByIdsDto {
  @IsArray()
  @IsString({ each: true })
  @IsIn(Object.values(GameCardId), { each: true })
  ids: GameCardId[];
}
