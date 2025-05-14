import { Injectable, inject } from '@angular/core';
import { RestStoreFactory } from './rest.store';
import { Category, Company, Product, User,Store, Unit } from '../core/core.index';
import { DashboardService } from '../core/service/dashboard/dashboard.service';


@Injectable({ providedIn: 'root' })
export class GlobalStore {
  private factory = inject(RestStoreFactory);
  private dashbord = inject(DashboardService);

  stores = this.factory.create<Store>('/api/stores');
  users = this.factory.create<User>('/api/users');
  categories = this.factory.create<Category>('/api/categories');
  products = this.factory.create<Product>('/api/products');
  units = this.factory.create<Unit>('/api/units');
  companies = this.factory.create<Company>('/api/companies');
}
