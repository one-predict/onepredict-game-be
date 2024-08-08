import {IsNotEmpty, IsOptional, IsString, IsEnum} from 'class-validator';
import { ExternalUserType } from "@auth/enums";
import { IsNumberOrString } from "@common/class-validators";

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
