import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './app/components/products/products.component';
import { ProductDetailComponent } from './app/components/product-detail/product-detail.component';

/**
 * Definición de rutas principales de la aplicación.
 * 
 * - '' (ruta raíz) carga el listado de productos.
 * - 'producto/:id' carga la vista de detalle para el producto seleccionado.
 */
const routes: Routes = [
  { path: '', component: ProductsComponent },
  { path: 'producto/:id', component: ProductDetailComponent }
];

/**
 * Punto de entrada de la aplicación Angular.
 * 
 * Utiliza la API `bootstrapApplication()` para iniciar el `AppComponent` como
 * componente raíz, junto con sus proveedores globales.
 * 
 * Proveedores registrados:
 * - `provideHttpClient`: habilita HttpClient para peticiones HTTP.
 * - `provideRouter`: habilita el sistema de enrutamiento con las rutas definidas.
 * - `importProvidersFrom`: importa módulos como `ReactiveFormsModule` y `FormsModule` 
 *   para formularios reactivos y template-driven.
 */
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    importProvidersFrom(ReactiveFormsModule, FormsModule)
  ]
}).catch(err => console.error(err));
