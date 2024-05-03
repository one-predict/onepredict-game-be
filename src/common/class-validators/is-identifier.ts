import { registerDecorator, ValidationOptions } from 'class-validator';
import { isIdentifier } from '@common/utils';
import { AnyObject } from '@common/types';

function IsIdentifier(validationOptions?: ValidationOptions) {
  return function (object: AnyObject, propertyName: string) {
    registerDecorator({
      name: 'isIdentifier',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => typeof value === 'string' && isIdentifier(value),
        defaultMessage: () => `${propertyName} must be a valid identifier`,
      },
    });
  };
}

export default IsIdentifier;
