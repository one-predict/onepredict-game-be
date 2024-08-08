import { registerDecorator, ValidationOptions } from 'class-validator';
import { AnyObject } from '@common/types';

function IsPortfolioSelectedToken(validationOptions?: ValidationOptions) {
  const MAX_ID_LENGTH = 100;

  return function (object: AnyObject, propertyName: string) {
    registerDecorator({
      name: 'isPortfolioSelectedToken',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => {
          if (typeof value !== 'object' || value === null) {
            return false;
          }

          if (!('id' in value) || typeof value.id !== 'string' || value.id.length > MAX_ID_LENGTH) {
            return false;
          }

          if (!('direction' in value) || typeof value.direction !== 'string') {
            return false;
          }

          return !(value.direction !== 'growth' && value.direction !== 'falling');
        },
        defaultMessage: () => `${propertyName} must be a portfolio token`,
      },
    });
  };
}

export default IsPortfolioSelectedToken;
