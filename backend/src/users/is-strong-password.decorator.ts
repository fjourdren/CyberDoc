import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const IS_STRONG_PASSWORD = 'isStrongPassword';

export function isStrongPassword(value: string): boolean {
  if (!value) return false;
  if (!value.match(/[A-Z]/g)) return false;
  if (!value.match(/[a-z]/g)) return false;
  if (!value.match(/[0-9]/g)) return false;
  // noinspection RedundantIfStatementJS
  if (!value.replace(/[0-9a-zA-Z ]/g, '').length) return false;

  return true;
}

export function IsStrongPassword(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_STRONG_PASSWORD,
      validator: {
        validate: (value): boolean => isStrongPassword(value),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must be a strong password',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
