import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Servicio encargado de manejar operaciones CRUD sobre productos,
 * utilizando la API pública de FakeStore (https://fakestoreapi.com).
 * 
 * Además, mantiene una caché local (`productsCache`) que mejora el rendimiento
 * y permite mantener los cambios visuales aunque la API no los persista realmente.
 * 
 * Este servicio se inyecta de forma global (`providedIn: 'root'`) y es usado
 * tanto por el componente de listado (`ProductsComponent`) como el de detalle (`ProductDetailComponent`).
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {

  /** URL base de la API FakeStore */
  private apiUrl = 'https://fakestoreapi.com/products';

 /** Caché local de productos para mantener estado en memoria */
  private productsCache: any[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los productos desde la API y guarda la respuesta en caché local.
   * 
   * @returns Observable con la lista de productos desde la API
   */
  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(products => this.productsCache = products)
    );
  }

  /**
   * Envía un nuevo producto a la API.
   * 
   * Nota: La API devuelve siempre el mismo `id`, por lo que
   * en el frontend generamos un `id` único local (usando `Date.now()`).
   * 
   * @param product Objeto que contiene título, precio, descripción y categoría.
   * @returns Observable con el producto que devuelve la API (mock).
   */
  addProduct(product: any) {
    return this.http.post<any>('https://fakestoreapi.com/products', product);
  }

  /**
   * Actualiza un producto existente en la API (según su ID).
   * 
   * Nota: La FakeStore API no persiste cambios realmente, por lo que también
   * se debe llamar a `updateProductLocal()` para reflejar los cambios en la vista.
   * 
   * @param id ID del producto a actualizar
   * @param product Objeto con los campos actualizados
   * @returns Observable con la respuesta simulada de la API
   */
  updateProduct(id: number, product: any) {
    return this.http.put<any>(
      `https://fakestoreapi.com/products/${id}`,
      product
    );
  }

  /**
   * Elimina un producto de la API (mock).
   * 
   * Nota: La API no elimina datos permanentemente, por lo tanto se debe
   * usar `removeProductFromCache()` para reflejar el cambio visualmente.
   * 
   * @param id ID del producto a eliminar
   * @returns Observable con respuesta de la API (mock)
   */
  deleteProduct(id: number) {
    return this.http.delete<any>(`https://fakestoreapi.com/products/${id}`);
  }

  /**
   * Busca un producto en la caché local según su ID.
   * 
   * Usado en la vista de detalle (`/producto/:id`) para evitar
   * volver a llamar a la API si los datos ya están cargados.
   * 
   * @param id ID del producto a buscar
   * @returns Objeto del producto o `undefined` si no existe
   */
  getProductByIdLocal(id: number): any {
    return this.productsCache.find((p) => p.id === id);
  }

  /**
   * Actualiza un producto existente directamente en el caché local.
   * 
   * Debe llamarse luego de editar un producto exitosamente para mantener
   * la sincronía entre los datos en la vista y la memoria.
   * 
   * @param id ID del producto a modificar
   * @param updated Objeto parcial con campos modificados
   */
  updateProductLocal(id: number, updated: Partial<any>) {
    const index = this.productsCache.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.productsCache[index] = { ...this.productsCache[index], ...updated };
    }
  }

  /**
   * Devuelve el array completo de productos que está en caché local.
   * 
   * Ideal para cargar productos en el componente de listado sin llamar
   * nuevamente a la API.
   * 
   * @returns Array de productos en memoria
   */
  getCachedProducts(): any[] {
    return this.productsCache;
  }
  
  /**
   * Elimina un producto del array en caché local.
   * 
   * Debe llamarse luego de eliminar un producto para actualizar la vista.
   * 
   * @param id ID del producto a eliminar
   */
  removeProductFromCache(id: number) {
    this.productsCache = this.productsCache.filter(p => p.id !== id);
  }
  
}
