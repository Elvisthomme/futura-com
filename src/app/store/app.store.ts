import { Injectable, inject } from '@angular/core';
import { RestStoreFactory } from './rest.store';
import { Category, Company, Product, User } from '../core/core.index';


@Injectable({ providedIn: 'root' })
export class GlobalStore {
  private factory = inject(RestStoreFactory);

  users = this.factory.create<User>('/api/users');
  categories = this.factory.create<Category>('/api/categories');
  products = this.factory.create<Product>('/api/products');
  companies = this.factory.create<Company>('/api/companies');
}
