import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IsIdentifier } from '@common/class-validators';

export class SignInDto {
  @IsNotEmpty()
  @IsString()
  signInMessage: string;

  @IsOptional()
  @IsIdentifier()
  referralId?: string;
}
