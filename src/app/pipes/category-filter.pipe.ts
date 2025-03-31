import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryFilter',
  standalone: true,
  //pure: true,
})
export class CategoryFilterPipe implements PipeTransform {
  transform(products: any[], category: string | null): any[] {
    if (!products || !category || category === 'all') {
      return products;
    }
    return products.filter((product) => product.category === category);
  }
}
