import { provideHttpClient, withFetch, HttpClientModule } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
//provideZoneChangeDetection
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
//import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    //provideClientHydration(), 
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),
    importProvidersFrom(HttpClientModule), 
    provideAnimationsAsync()
  ]
};
