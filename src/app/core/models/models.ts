export interface pageSelection {
  skip: number;
  limit: number;
}
export interface apiResultFormat {
  data: [];
  totalData: number;
}

// user.model.ts
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  image_url: string | null;
  role_id: number;
  company_id: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;       // ISO date coming from backend
  updated_at: string;       // ISO date coming from backend
}

export interface Company {
  id: number;
  name: string;
  subdomain: string;
  created_at: string;       // ISO date coming from backend
  updated_at: string;       // ISO date coming from backend
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
  created_at: string;       // ISO date coming from backend
  updated_at: string;       // ISO date coming from backend
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  quantity_alert: number;
  expire_on: string | null;       // ISO date coming from backend
  image_url: string | null;
  category_id: number;
  company_id: number;
  created_at: string;       // ISO date coming from backend
  updated_at: string;       // ISO date coming from backend
}
