import { registerDecorator, ValidationOptions } from 'class-validator';
import { AnyObject } from '@common/types';
import { GameCardId } from '@card/enums';

function IsCardsStack(validationOptions?: ValidationOptions) {
  const allowedKeysSet = new Set(Object.values(GameCardId));

  return function (object: AnyObject, propertyName: string) {
    registerDecorator({
      name: 'isCardsStack',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => {
          if (typeof value !== 'object' || value === null) {
            return false;
          }

          const keys = Object.keys(value);

          if (keys.length > allowedKeysSet.size) {
            return false;
          }

          for (const key of keys) {
            if (!allowedKeysSet.has(key as GameCardId)) {
              return false;
            }

            if (typeof value[key] !== 'number') {
              return false;
            }
          }

          return true;
        },
        defaultMessage: () => `${propertyName} must be a cards stack`,
      },
    });
  };
}

export default IsCardsStack;
