import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { IsNumberOrString } from '@common/class-validators';
import { ExternalUserType } from '@user/enums';

export class GetUserByExternalIdDto {
  @IsNotEmpty()
  @IsNumberOrString()
  externalId: string | number;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsNumberOrString()
  externalId: string | number;

  @IsNotEmpty()
  @IsEnum(ExternalUserType)
  externalType: ExternalUserType;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  avatarUrl: string;
}
