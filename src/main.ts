import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Main Application Entry Point
 * Bootstraps the Angular application with the root component and configuration
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
