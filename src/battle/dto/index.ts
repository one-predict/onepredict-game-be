import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class GetBattleDto {
  @IsIdentifier()
  ownerId: string;

  @IsIdentifier()
  offerId: string;
}

export class AddPlayerDto {
  @IsNotEmpty()
  @IsString()
  displayId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class GetByDisplayIdDto {
  @IsNotEmpty()
  displayId: string;
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
