import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ProductService } from '../../services/product.service';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Componente standalone que muestra el detalle de un producto.
 * Se accede mediante la ruta `/producto/:id`.
 * 
 * Muestra título, imagen, precio, descripción y categoría del producto.
 * Ofrece un botón para volver al listado principal.
 */
@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, NgIf, RouterModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  product: any;

    /**
   * Constructor del componente.
   * @param route Permite acceder al parámetro `id` de la ruta.
   * @param productService Servicio para obtener productos desde el caché o la API.
   * @param router Permite la navegación programática (volver al listado).
   */
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    public router: Router
  ) {}

    /**
   * Ciclo de vida OnInit:
   * Obtiene el ID de la ruta, intenta cargar el producto desde caché local,
   * y si no existe, lo carga desde la API como respaldo.
   */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product = this.productService.getProductByIdLocal(id);
  
    // fallback opcional por si no está cargado aún (ej: acceso directo)
    if (!this.product) {
      this.productService.getProducts().subscribe(products => {
        this.product = products.find(p => p.id === id);
      });
    }
  }  
}
