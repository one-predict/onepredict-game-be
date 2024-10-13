import { IsString, IsNotEmpty } from 'class-validator';
export class UserWalletAddressDto {
  @IsNotEmpty()
  @IsString()
  walletAddress?: string;
}
