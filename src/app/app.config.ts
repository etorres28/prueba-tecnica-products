import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

/**
 * Configuración principal de la aplicación Angular.
 * 
 * Este objeto define los proveedores globales que se utilizan en el arranque
 * de la aplicación a través de la función `bootstrapApplication()`.
 * 
 * Incluye:
 * - `provideRouter`: Registra las rutas de la aplicación.
 * - `provideZoneChangeDetection`: Optimiza la detección de cambios con Zone.js.
 * 
 * `eventCoalescing: true` combina múltiples eventos del DOM en un solo ciclo
 * de detección de cambios para mejorar el rendimiento.
 */
export const appConfig: ApplicationConfig = {
  // Proveedor para la detección de cambios eficiente usando Zone.js
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)] // Proveedor para el sistema de rutas de Angular
};
