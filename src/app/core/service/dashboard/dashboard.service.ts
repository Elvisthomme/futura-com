// src/app/core/auth/auth.service.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CsrfService } from '../csrf/csrf.service';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { attachAuthExpiredInterceptor } from '../../interceptors/axios-auth-expired.interceptor';
import { createDefaultUser, User, Store, Product } from '../../core.index';

export interface DashBoardHeaderData {
  user: User,
  notification_count: number | null,
  message_count: number | null,
  stores: Store[]
}
/* ---------------------------------------------------------------------- */
/*  Dashboard payload coming from:  DashboardController@index (Laravel)   */
/* ---------------------------------------------------------------------- */

/** Months are always 1-based in the PHP code (array_fill(1, 12, …)) */
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Map of month → monetary total (kept as string because Laravel encodes
 * DECIMAL/NUMERIC columns as strings in JSON).
 */
export type MonthlyTotals = Record<Month, string>;

/**
 * Map of year → { month → total }.
 * The PHP arrays become JSON objects, so years arrive as string keys,
 * but indexing with `number` also works because TS converts them to string
 * behind the scenes.
 */
export type YearlyTotals = Record<number, MonthlyTotals>;

export interface DashboardMetrics {
  /** sales[year][month] */
  sales: YearlyTotals;

  /** purchases[year][month] */
  purchases: YearlyTotals;

  recent_products: Product[];
  recently_expired_products: Product[];

  total_purchase_due: string;
  total_sales_due: string;

  total_sale_amount: string;
  total_purchase_invoice: string;
  total_sales_invoice: string;

  total_customer: number;
  total_supplier: number;

  total_expense_amount: string;
}




@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = axios.create({
    baseURL: environment.apiBaseUrl,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: { Accept: 'application/json' }
  });
  private readonly csrf = inject(CsrfService);
  private readonly webstorage = inject(WebstorgeService);

  private createDefaultDashBoardHeaderData = (): DashBoardHeaderData => ({
    user: createDefaultUser(),
    notification_count: 0,
    message_count: 0,
    stores: []
  });
  private _headerData = signal<DashBoardHeaderData>(this.createDefaultDashBoardHeaderData());
  private _dashboardMetricsData = signal<DashboardMetrics>(
    {
      sales: {},
      purchases: {},
      recent_products: [],
      recently_expired_products: [],
      total_purchase_due: '',
      total_sales_due: '',
      total_sale_amount: '',
      total_purchase_invoice: '',
      total_sales_invoice: '',
      total_customer: 0,
      total_supplier: 0,
      total_expense_amount: ''
    }
  );

  /* derived helpers */
  public headerData = computed(() => this._headerData());
  public dashboardMetricsData = computed(() => this._dashboardMetricsData());
  constructor() {
    attachAuthExpiredInterceptor(
      this.http,
      () => this.webstorage.logout(),   // or this.runLocalLogoutSideEffects()
    );
  }
  getHeader(): Observable<DashBoardHeaderData> {
    /* 1️⃣  Ensure CSRF cookie, then 2️⃣  run the real request */
    return this.csrf.init().pipe(
      switchMap(() =>
        from(this.http.get<DashBoardHeaderData>('/api/header'))
      ),
      map((resp: AxiosResponse<DashBoardHeaderData>) => {
        console.log(resp.data)
        this._headerData.set(resp.data);
        return resp.data
      })
    );
  }


  getDashboardMetrics(): Observable<DashboardMetrics> {
    /* 1️⃣  Ensure CSRF cookie, then 2️⃣  run the real request */
    return this.csrf.init().pipe(
      switchMap(() =>
        from(this.http.get<DashboardMetrics>('/api/index'))
      ),
      map((resp: AxiosResponse<DashboardMetrics>) => {
        console.log(resp.data)
        this._dashboardMetricsData.set(resp.data);
        return resp.data
      })
    );
  }
}
