import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CategoryFilterPipe } from '../../pipes/category-filter.pipe';
import { RouterModule } from '@angular/router';

/**
 * Componente principal para la gestión de productos.
 * 
 * Funcionalidades:
 * - Listado de productos con paginación
 * - Búsqueda por título
 * - Filtro por categoría
 * - Formulario reactivo para agregar y editar productos
 * - Validaciones estándar y personalizada por categoría
 * - Sincronización con caché local para mantener persistencia visual
 * - Modales de confirmación (Bootstrap)
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CategoryFilterPipe,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  // Lista completa de productos (cargada desde la API o caché)
  allProducts: any[] = [];

  // Lista de productos filtrados y paginados que se muestran en pantalla
  displayedProducts: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 5;

  /** Formulario reactivo para agregar/editar productos */
  form!: FormGroup;
  isEditing = false;

  modalMessage: string = '';
  modalTitle: string = 'Éxito';
  showModal: boolean = false;

  FormControl: string = 'all';
  categoryControl = new FormControl('all');

  // Categorías únicas extraídas de los productos
  categories: string[] = [];

  // Productos filtrados antes de paginar
  filteredProducts: any[] = [];

  // Generador simple de IDs únicos para productos nuevos
  private nextId = 1000;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  /**
   * Inicialización del componente:
   * - Configura el formulario y sus validaciones
   * - Escucha cambios en búsqueda y categoría
   * - Carga productos desde caché o API
   */
  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: ['', [Validators.required, this.validateCategory]]
    });

    // Actualiza filtros al cambiar búsqueda
    this.searchControl.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.filterProducts();
    });

    // Actualiza filtros al cambiar categoría
    this.categoryControl.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.filterProducts();
    });

    // Carga productos desde caché o desde la API
    const cached = this.productService.getCachedProducts();
    if (cached && cached.length > 0) {
      this.allProducts = cached;
      this.extractCategories();
      this.filterProducts();
    } else {
      this.productService.getProducts().subscribe((data) => {
        this.allProducts = data;
        this.extractCategories();
        this.filterProducts();
      });
    }
  }

  // Control de formulario reactivo para búsqueda
  searchControl = new FormControl('');

  loadProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.allProducts = data;
      this.extractCategories();
      this.filterProducts();
    });
  }

    /**
   * Filtra los productos según búsqueda y categoría,
   * luego aplica la paginación.
   */
  filterProducts() {
    let filtered = this.allProducts;

    const search = this.searchControl.value?.toLowerCase() || '';
    const category = this.categoryControl.value;

    if (search) {
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(search));
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }

    this.filteredProducts = filtered;

    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedProducts = filtered.slice(start, start + this.pageSize);
  }

  /**
 * Reinicia la página actual a 1 y aplica los filtros
 * de búsqueda y categoría. Se puede llamar desde el HTML
 * cuando cambia el input de búsqueda.
 */
  onSearchChange() {
    this.currentPage = 1;
    this.filterProducts();
  }

  // Avanza a la siguiente página
  nextPage() {
    this.currentPage++;
    this.filterProducts();
  }

  // Retrocede una página si es posible
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterProducts();
    }
  }

  // Reinicia el formulario y sale del modo edición
  resetForm() {
    this.form.reset();
    this.isEditing = false;
  }

  /**
   * Envía el formulario:
   * - Si está en modo edición: actualiza el producto
   * - Si no: agrega un producto nuevo
   */
  submitForm() {
    if (this.form.invalid) return;

    const { id, title, price, description, category } = this.form.value;

    if (this.isEditing && id != null) {
      this.productService
        .updateProduct(id, { title, price, description, category })
        .subscribe(() => {
          const index = this.allProducts.findIndex((p) => p.id === id);
          if (index !== -1) {
            this.allProducts[index] = {
              ...this.allProducts[index],
              title,
              price,
              description,
              category,
            };
          }

          this.productService.updateProductLocal(id, { // Actualiza en el caché del servicio
            title,
            price,
            description,
            category,
          });
          this.resetForm();
          this.filterProducts();
          this.openModal('Producto actualizado correctamente');
        });
    } else {
      this.productService
        .addProduct({ title, price, description, category })
        .subscribe((newProduct) => {
          const uniqueId = Date.now(); // Simula un ID único
          this.allProducts.unshift({ // Agrega el producto al inicio
            ...newProduct,
            title,
            price,
            description,
            category,
            id: uniqueId,
          });

          this.resetForm();
          this.filterProducts();
          this.openModal('Producto agregado con éxito');
        });
    }
  }

  /**
   * Carga un producto en el formulario para editarlo.
   * @param product Producto seleccionado
   */
  editProduct(product: any) {
    this.form.setValue({
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description || '',
      category: product.category || ''
    });
    this.isEditing = true;
  }  

  /**
   * Elimina un producto tras confirmación del usuario.
   * También lo elimina del caché del servicio.
   * @param id ID del producto a eliminar
   */
  deleteProduct(id: number) {
    if (confirm('¿Estás seguro que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.allProducts = this.allProducts.filter(product => product.id !== id);
        this.productService.removeProductFromCache(id);
        this.filterProducts();
        this.openModal('Producto eliminado con éxito');
      });      
    }
  }

  /**
   * Abre el modal de confirmación con un mensaje personalizado.
   * @param message Texto que se mostrará en el modal
   */
  openModal(message: string) {
    this.modalMessage = message;
    this.showModal = true;
  }

  /**
   * Cierra el modal de confirmación.
   */
  closeModal() {
    this.showModal = false;
  }

  /**
   * Extrae todas las categorías únicas de los productos y actualiza el filtro.
   */
  extractCategories() {
    const allCats = this.allProducts.map((p) => p.category);
    this.categories = Array.from(new Set(allCats));
  }

  /**
   * Verifica si hay más páginas disponibles para la paginación.
   * @returns `true` si existe una página siguiente
   */
  hasNextPage(): boolean {
    const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    return this.currentPage < totalPages;
  }

    /**
   * Validador personalizado para el campo de categoría.
   * Retorna error si la categoría ingresada no existe en la lista.
   */
  validateCategory = (control: FormControl) => {
    if (!this.categories.includes(control.value)) {
      return { invalidCategory: true };
    }
    return null;
  };
}
