import { ArrayMaxSize, IsArray, IsIn, IsNotEmpty } from 'class-validator';
import { DigitalAssetId } from '@digital-assets/enums';

export class ListDigitalAssetsTicksDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(6)
  @IsIn(Object.values(DigitalAssetId), { each: true })
  assetIds: DigitalAssetId[];
}
