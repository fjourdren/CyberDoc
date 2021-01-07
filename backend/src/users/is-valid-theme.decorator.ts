import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const IS_VALID_THEME = 'isValidTheme';
export const VALID_THEMES = [
  'deeppurple-amber',
  'indigo-pink',
  'pink-bluegrey',
  'purple-green',
];

export function IsValidTheme(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_VALID_THEME,
      validator: {
        validate: (value): boolean => VALID_THEMES.includes(value),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            '$property must be one of these values : ' +
            JSON.stringify(VALID_THEMES),
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
