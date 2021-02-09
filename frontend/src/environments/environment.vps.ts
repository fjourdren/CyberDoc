// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiBaseURL: 'https://api.cyberdoc.fulgen.fr',
  authCookieDomain: 'cyberdoc.fulgen.fr',
  authCookieName: 'access_token',
  userLocalStorageKey: 'real_user',
  etherpadBaseUrl: 'https://etherpad.cyberdoc.fulgen.fr',
  stripePublicKey:
    'pk_test_51IAhqQJtuzyH7f5D6s19N5gW9iANxOKn82MJELcCnJGvaVhbQhADRksH1Mg8z3qFLXUIVowcHMJ8Ks6FGLCo0mXo00qlEty6Vs',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
