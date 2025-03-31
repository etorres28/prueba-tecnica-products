import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://fakestoreapi.com/products';
  private productsCache: any[] = [];

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(products => this.productsCache = products)
    );
  }

  addProduct(product: any) {
    return this.http.post<any>('https://fakestoreapi.com/products', product);
  }

  updateProduct(id: number, product: any) {
    return this.http.put<any>(
      `https://fakestoreapi.com/products/${id}`,
      product
    );
  }

  deleteProduct(id: number) {
    return this.http.delete<any>(`https://fakestoreapi.com/products/${id}`);
  }

  getProductByIdLocal(id: number): any {
    return this.productsCache.find((p) => p.id === id);
  }

  updateProductLocal(id: number, updated: Partial<any>) {
    const index = this.productsCache.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.productsCache[index] = { ...this.productsCache[index], ...updated };
    }
  }

  getCachedProducts(): any[] {
    return this.productsCache;
  }
  
}
