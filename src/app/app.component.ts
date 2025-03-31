import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';

/**
 * Componente raíz (`AppComponent`) de la aplicación Angular.
 * 
 * Este componente es de tipo standalone y actúa como contenedor principal.
 * 
 * Su función principal es alojar el `<router-outlet>` donde se inyectan
 * dinámicamente las vistas de otros componentes según la ruta activa.
 * 
 * En este proyecto, muestra:
 * - El listado de productos (`/`)
 * - El detalle de producto (`/producto/:id`)
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule], // Importa el módulo de rutas para usar <router-outlet>
  template: `<router-outlet></router-outlet>`, // Punto de entrada dinámico de rutas
  styleUrl: './app.component.scss' // Estilos globales del componente raíz
})
export class AppComponent {
   /** Título general de la aplicación (opcionalmente usado en el layout) */
  title = 'prueba-tecnica-products';
}
