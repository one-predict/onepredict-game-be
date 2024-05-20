import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class GetUserByFidDto {
  @IsNotEmpty()
  @IsNumber()
  fid: number;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsNumber()
  fid: number;
}

export class GetUserRankByIdDto {
  @IsNotEmpty()
  @IsIdentifier()
  userId: string;
}
