import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';

if (environment.production) {
  enableProdMode();
}

if (environment.useSentry) {
  console.warn('environment.useSentry = true');

  Sentry.init({
    dsn:
      'https://59b3a78234eb42b1b86201e769c04da0@o460915.ingest.sentry.io/5461926',
    integrations: [
      new Integrations.BrowserTracing({
        tracingOrigins: ['localhost', 'http://api.cyberdoc.fulgen.fr'],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
