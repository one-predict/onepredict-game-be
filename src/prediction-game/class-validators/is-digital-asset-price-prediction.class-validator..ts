import { registerDecorator, ValidationOptions } from 'class-validator';
import { AnyObject } from '@common/types';
import { DigitalAssetPriceDirection, DigitalAssetId } from '@digital-assets/enums';

function IsDigitalAssetPricePrediction(validationOptions?: ValidationOptions) {
  const AVAILABLE_ASSETS_SET = new Set(Object.values(DigitalAssetId));
  const AVAILABLE_PRICE_DIRECTIONS_SET = new Set(Object.values(DigitalAssetPriceDirection));

  return function (object: AnyObject, propertyName: string) {
    registerDecorator({
      name: 'isDigitalAssetPricePrediction',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => {
          if (typeof value !== 'object' || value === null) {
            return false;
          }

          if (!('assetId' in value) || !AVAILABLE_ASSETS_SET.has(value.assetId as DigitalAssetId)) {
            return false;
          }

          return (
            'priceDirection' in value &&
            AVAILABLE_PRICE_DIRECTIONS_SET.has(value.priceDirection as DigitalAssetPriceDirection)
          );
        },
        defaultMessage: () => `${propertyName} must be a digital asset prediction`,
      },
    });
  };
}

export default IsDigitalAssetPricePrediction;
