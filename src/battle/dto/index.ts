import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class GetBattleDto {
  @IsIdentifier()
  ownerId: string;

  @IsIdentifier()
  offerId: string;
}

export class AddPlayersDto {
  @IsNotEmpty()
  battleId: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

export class GetByBattleIdDto {
  @IsNotEmpty()
  battleId: string;
}

export class CreateBattlePayloadDto {
  @IsNotEmpty()
  @IsIdentifier()
  ownerId: string;

  @IsNotEmpty()
  @IsIdentifier()
  offerId: string;

  @IsNotEmpty()
  @IsNumber()
  entryPrice: number;
}
