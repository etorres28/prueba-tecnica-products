import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ProductService } from '../services/product.service';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { CategoryFilterPipe } from '../pipes/category-filter.pipe';
import { RouterModule } from '@angular/router';

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
  allProducts: any[] = [];
  displayedProducts: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 5;

  form!: FormGroup;
  isEditing = false;

  modalMessage: string = '';
  modalTitle: string = 'Éxito';
  showModal: boolean = false;

  //selectedCategory: string = 'all';
  FormControl: string = 'all';
  categoryControl = new FormControl('all');
  categories: string[] = [];
  filteredProducts: any[] = [];
  private nextId = 1000;

  constructor(
    private productService: ProductService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      category: ['', [Validators.required, this.validateCategory]]
    });

    this.searchControl.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.filterProducts();
    });

    this.categoryControl.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.filterProducts();
    });

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

  searchControl = new FormControl('');

  loadProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.allProducts = data;
      this.extractCategories();
      this.filterProducts();
    });
  }

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

    this.filteredProducts = filtered; // 👈 guarda los filtrados completos

    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedProducts = filtered.slice(start, start + this.pageSize);
  }

  onSearchChange() {
    this.currentPage = 1;
    this.filterProducts();
  }

  nextPage() {
    this.currentPage++;
    this.filterProducts();
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterProducts();
    }
  }

  resetForm() {
    this.form.reset();
    this.isEditing = false;
  }

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

          this.productService.updateProductLocal(id, {
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
          const uniqueId = Date.now();
          this.allProducts.unshift({
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

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.allProducts = this.allProducts.filter(
          (product) => product.id !== id
        );
        this.filterProducts();
        this.openModal('Producto eliminado con éxito');
      });
    }
  }

  openModal(message: string) {
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  extractCategories() {
    const allCats = this.allProducts.map((p) => p.category);
    this.categories = Array.from(new Set(allCats));
  }

  hasNextPage(): boolean {
    const totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    return this.currentPage < totalPages;
  }

  validateCategory = (control: FormControl) => {
    if (!this.categories.includes(control.value)) {
      return { invalidCategory: true };
    }
    return null;
  };
}
