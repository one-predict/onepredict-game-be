import { registerDecorator, ValidationOptions } from 'class-validator';
import { AnyObject } from '@common/types';

function IsNumberOrString(validationOptions?: ValidationOptions) {
  return function (object: AnyObject, propertyName: string) {
    registerDecorator({
      name: 'isNumberOrString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => typeof value === 'string' || typeof value === 'number',
        defaultMessage: () => `${propertyName} must be a string or number`,
      },
    });
  };
}

export default IsNumberOrString;
