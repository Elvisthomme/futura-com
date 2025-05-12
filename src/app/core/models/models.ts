export interface pageSelection {
  skip: number;
  limit: number;
}
export interface apiResultFormat {
  data: [];
  totalData: number;
}


export const createDefaultUser = (): User => ({
  id: 0,
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: null,
  image_url: null,
  role_id: 0,
  company_id: 0,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});
/* -------------------------------- Core helpers ----------------------------- */
export type Id = number | string;

export interface BaseEntity {
  id: Id;
  created_at: string;             // ISO date-time
  updated_at: string;
  deleted_at?: string | null;     // present only when SoftDeletes is used
}

/* ----------------------------- Attendance ----------------------------------*/
export interface Attendance extends BaseEntity {
  company_id: Id;
  employee_id: Id;
  date: string;                   // ISO date
  status: string;
}

/* ----------------------------- Brand ---------------------------------------*/
export interface Brand extends BaseEntity {
  company_id: Id;
  name: string;
  status: string;
  image_url?: string | null;
}

/* ----------------------------- Category ------------------------------------*/
export interface Category extends BaseEntity {
  company_id: Id;
  name: string;
  code?: string | null;
  description?: string | null;
  status: string;
  category_id?: Id | null;        // parent (for sub-categories)
  image_url?: string | null;
}

/* ----------------------------- Company -------------------------------------*/
export interface Company extends BaseEntity {
  name: string;
  subdomain?: string | null;
}

/* ----------------------------- Customer ------------------------------------*/
export interface Customer extends BaseEntity {
  company_id: Id;
  name: string;
  code?: string | null;
  email?: string | null;
  country_code?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  image_url?: string | null;
}

/* ----------------------------- Department ----------------------------------*/
export interface Department extends BaseEntity {
  company_id: Id;
  name: string;
  description?: string | null;
  h_o_d?: Id | null;              // user id of head of department
  status: string;
  image_url?: string | null;
}

/* ----------------------------- Designation ---------------------------------*/
export interface Designation extends BaseEntity {
  company_id: Id;
  name: string;
  status: string;
  image_url?: string | null;
}

/* ----------------------------- Employee ------------------------------------*/
export interface Employee extends BaseEntity {
  company_id: Id;
  first_name: string;
  last_name: string;
  contact_number?: string | null;
  code?: string | null;
  email?: string | null;
  department_id?: Id | null;
  designation_id?: Id | null;
  shift_id?: Id | null;
  image_url?: string | null;
  nationality?: string | null;
  status?: string | null;
  blood_group?: string | null;
  emergency_name_1?: string | null;
  emergency_address_1?: string | null;
  emergency_city_1?: string | null;
  emergency_name_2?: string | null;
  emergency_address_2?: string | null;
  emergency_city_2?: string | null;
  date_of_birth?: string | null;   // ISO date
  joining_date?: string | null;    // ISO date
}

/* ----------------------------- Expense -------------------------------------*/
export interface Expense extends BaseEntity {
  company_id: Id;
  category: string;
  amount: string;                 // keep as string; Laravel JSON encodes decimals
  note?: string | null;
  user_id: Id;
}

/* ----------------------------- Invoice -------------------------------------*/
export interface Invoice extends BaseEntity {
  company_id: Id;
  order_id: Id;
  total_amount: string;
  due_date: string;               // ISO date
  status: string;
  image_url?: string | null;
}

/* ----------------------------- Leave ---------------------------------------*/
export interface Leave extends BaseEntity {
  company_id: Id;
  employee_id: Id;
  start_date: string;             // ISO date
  end_date: string;               // ISO date
  reason?: string | null;
  status: string;
}

/* ----------------------------- Break ---------------------------------------*/
export interface Break extends BaseEntity {
  company_id: Id;
  shift_id: Id;
  type: string;
  start_time: string;             // HH:mm or ISO time
  end_time: string;
  description?: string | null;
}

/* ----------------------------- Order ---------------------------------------*/
export interface Order extends BaseEntity {
  company_id: Id;
  customer_id: Id;
  user_id: Id;
  product_total_amount: string;
  total_tax_amount: string;
  total_discount_amount: string;
  total_amount_to_pay: string;
  shipping?: string | null;
  status: string;
  image_url?: string | null;
}

/* ----------------------------- Order Item ----------------------------------*/
export interface OrderItem extends BaseEntity {
  company_id: Id;
  order_id: Id;
  product_id: Id;
  quantity: string;
  price: string;
}

/* ----------------------------- Permission ----------------------------------*/
export interface Permission extends BaseEntity {
  company_id: Id;
  module: string;
  create: boolean;
  edit: boolean;
  delete: boolean;
  view: boolean;
  allow_all: boolean;
}

/* ----------------------------- Product -------------------------------------*/
export interface Product extends BaseEntity {
  company_id: Id;
  name: string;
  SKU: string;
  description?: string | null;
  product_bare_code?: string | null;
  price: string;
  tax_value?: string | null;
  quantity: string;
  quantity_alert?: string | null;
  discount_value?: string | null;
  tax_type?: string | null;
  discount_type?: string | null;
  selling_type?: string | null;
  barcode_symbology?: string | null;
  category_id?: Id | null;
  brand_id?: Id | null;
  unit_id?: Id | null;
  warranty_id?: Id | null;
  attributes?: string | null;       // JSON string
  manufactured_date?: string | null;
  expire_on?: string | null;
  warehouse_id?: Id | null;
  store_id?: Id | null;
  created_by?: Id | null;
  image_url?: string | null;        // comes from accessor
}

/* ----------------------------- Product Image -------------------------------*/
export interface ProductImage extends BaseEntity {
  company_id: Id;
  product_id: Id;
  image_url: string;
  is_main: boolean;
}

/* ----------------------------- Report --------------------------------------*/
export interface Report extends BaseEntity {
  company_id: Id;
  type: string;
  start_date?: string | null;
  end_date?: string | null;
  data: Record<string, unknown>;    // JSON column
  image_url?: string | null;
}

/* ----------------------------- Role ----------------------------------------*/
export interface Role extends BaseEntity {
  company_id: Id;
  name: string;
}

/* ----------------------------- Setting -------------------------------------*/
export interface Setting extends BaseEntity {
  company_id: Id;
  type: string;
  data: Record<string, unknown>;
  image_url?: string | null;
}

/* ----------------------------- Shift ---------------------------------------*/
export interface Shift extends BaseEntity {
  company_id: Id;
  name: string;
  start_time: string;              // HH:mm
  end_time: string;
  week_off?: string | null;
  recurring?: string | null;
  status: string;
}

/* ----------------------------- Shift Weekday -------------------------------*/
export interface ShiftWeekday extends BaseEntity {
  company_id: Id;
  shift_id: Id;
  day: string;                     // Mon, Tue, …
  weeks: string[];                 // comes from JSON cast
}

/* ----------------------------- Stock ---------------------------------------*/
export interface Stock extends BaseEntity {
  company_id: Id;
  product_id: Id;
  quantity: string;
  quantity_alert?: string | null;
  user_id: Id;
  store_id?: Id | null;
  warehouse_id?: Id | null;
}

/* ----------------------------- Stock Adjustment ----------------------------*/
export interface StockAdjustment extends BaseEntity {
  company_id: Id;
  stock_id: Id;
  warehouse_id: Id;
  adjustment_type: string;
  quantity: string;
  reason?: string | null;
  user_id: Id;
}

/* ----------------------------- Stock Transfer ------------------------------*/
export interface StockTransfer extends BaseEntity {
  company_id: Id;
  from_id: Id;                     // warehouse id
  to_id: Id;                       // warehouse id
  product_id: Id;
  reason?: string | null;
  user_id: Id;
  quantity: string;
}

/* ----------------------------- Store ---------------------------------------*/
export interface Store extends BaseEntity {
  name: string;
  email?: string | null;
  country?: string | null;
  country_code?: string | null;
  phone?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  zip_code?: string | null;
  image_url?: string | null;
  status: string;
  dashboard_id?: Id | null;
}

/* ----------------------------- Supplier ------------------------------------*/
export interface Supplier extends BaseEntity {
  company_id: Id;
  name: string;
  code?: string | null;
  email?: string | null;
  country_code?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  description?: string | null;
  image_url?: string | null;
}

/* ----------------------------- Unit ----------------------------------------*/
export interface Unit extends BaseEntity {
  company_id: Id;
  name: string;
  short_name: string;
  image_url?: string | null;
  status: string;
  num_of_product?: number;         // accessor
}

/* ----------------------------- User ----------------------------------------*/
export interface User extends BaseEntity {
  username: string;
  email: string;
  email_verified_at?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  description?: string | null;
  status?: string | null;
  image_url?: string | null;
  company_id?: Id | null;
  role_id?: Id | null;
}

/* ----------------------------- UserStore -----------------------------------*/
export interface UserStore extends BaseEntity {
  company_id: Id;
  role_id: Id;
  user_id: Id;
  store_id: Id;
}

/* ----------------------------- Warehouse -----------------------------------*/
export interface Warehouse extends BaseEntity {
  company_id: Id;
  name: string;
  email?: string | null;
  country?: string | null;
  country_code?: string | null;
  phone?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  state?: string | null;
  city?: string | null;
  zip_code?: string | null;
  image_url?: string | null;
  status: string;
}

/* ----------------------------- Warranty ------------------------------------*/
export interface Warranty extends BaseEntity {
  company_id: Id;
  name: string;
  duration: string;
  duration_unit: string;
  description?: string | null;
  image_url?: string | null;
  status: string;
}
