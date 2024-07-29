import { IsNotEmpty, IsNumber } from 'class-validator';

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
