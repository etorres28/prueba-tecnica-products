import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado que filtra un arreglo de productos por categoría.
 * 
 * Este pipe se usa en la plantilla para mostrar únicamente los productos
 * que coincidan con la categoría seleccionada.
 * 
 * Si la categoría es 'all' o null, devuelve la lista completa.
 * 
 * Uso en template:
 * 
 * ```html
 * *ngFor="let product of products | categoryFilter:selectedCategory"
 * ```
 */
@Pipe({
  name: 'categoryFilter',
  standalone: true,
})
export class CategoryFilterPipe implements PipeTransform {
  
    /**
   * Filtra el array de productos por la categoría proporcionada.
   *
   * @param products Arreglo de productos a filtrar.
   * @param category Categoría por la cual se quiere filtrar.
   * @returns Arreglo de productos filtrados por la categoría.
   */
  transform(products: any[], category: string | null): any[] {
    if (!products || !category || category === 'all') {
      return products;
    }
    return products.filter((product) => product.category === category);
  }
}
