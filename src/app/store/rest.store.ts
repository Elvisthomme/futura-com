// src/app/core/store/rest-store.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CsrfService } from '../core/service/csrf/csrf.service';
import { attachAuthExpiredInterceptor } from '../core/interceptors/axios-auth-expired.interceptor';
import { WebstorgeService } from '../shared/webstorge.service';
import { Sort } from '@angular/material/sort';

/** ----------  Types that match Laravel's default API shape ---------- */
export interface PaginatedResponse<T> {
  data: T[];
  links: Record<string, string | null>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
export interface Pagination {
  links: Record<string, string | null>;
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
type Id = number | string;

/** ====================================================================
 *  Factory that can mint one store per endpoint
 *  ===================================================================*/
@Injectable({ providedIn: 'root' })
export class RestStoreFactory {

  private readonly http = axios.create({
    baseURL: environment.apiBaseUrl,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: { Accept: 'application/json' }
  });

  private csrf = inject(CsrfService);
  private readonly webstorage = inject(WebstorgeService);

  constructor() {
    attachAuthExpiredInterceptor(
      this.http,
      () => this.webstorage.logout(),   // or this.runLocalLogoutSideEffects()
    );
  }

  /**
   * Build a fully-featured CRUD store for a given endpoint.
   * Every item **must** expose an `id` field.
   */
  create<T extends { id: Id }>(endpoint: string) {

    /* ----------------------------------------------------------------
     * 1️⃣  Signals — the reactive state everyone in your app consumes
     * ---------------------------------------------------------------*/
    const _items = signal<(T & { is_selected?: boolean })[]>([]);
    const _selectedItem = signal<T | null>(null);
    const _editItem = signal<T | null>(null);
    const _pagination = signal<Pagination | null>(null);

    /* derived helpers */
    const items = computed(() => _items());
    const selectedItem = computed(() => _selectedItem());
    const editItem = computed(() => _editItem());
    const count = computed(() => _items().length);
    const pageInfo = computed(() => _pagination());

    /* ----------------------------------------------------------------
     * 2️⃣  Internal helpers to keep the array in sync
     * ---------------------------------------------------------------*/
    const upsert = (entity: T) =>
      _items.update(list => {
        const i = list.findIndex(e => e.id === entity.id);
        if (i === -1) {
          return [...list, entity];            // ① append
        }
        const next = [...list];                // ② copy-on-write
        next[i] = entity;                      //    replace
        return next;                           //    notify dependents
      });

    const remove = (id: Id) =>
      _items.update(list =>
        list.filter(e => e.id !== id)          // return brand-new array
      );


    /* ----------------------------------------------------------------
     * 3️⃣  Axios helpers — GET & “write” that auto-injects the CSRF
     * ---------------------------------------------------------------*/
    const get = <R>(url = '', params?: string): Observable<R> =>
      from(this.http.get<R>(endpoint + url, { params }))
        .pipe(map((r: AxiosResponse<R>) => r.data));

    const write = <R>(
      method: 'post' | 'put' | 'patch' | 'delete',
      url = '',
      data?: object
    ): Observable<R> => {
      if (method === 'put' || method === 'patch') {
        data = { _method: method, ...data }; // Laravel workaround
        method = 'post'; // Laravel workaround
      }
      return this.csrf.init().pipe(                           // 🔐 1. ensure cookie
        switchMap(() =>                               // 🔐 2. real request
          from(this.http.request<R>({ url: endpoint + url, method, data }))
        ),
        map((r: AxiosResponse<R>) => r.data)
      );
    }

    /* ----------------------------------------------------------------
     * 4️⃣  Public CRUD API ------------------------------------------------*/
    const list = (params?: string) =>
      get<PaginatedResponse<T>>('', params).pipe(
        map(resp => {
          _items.set(resp.data);
          _pagination.set({ links: resp.links, meta: resp.meta });
          console.log(resp.data);
          return resp;
        })
      );

    const find = (id: Id) =>
      get<T>(`/${id}`).pipe(
        map(resp => {
          upsert(resp);
          console.log(resp);
          return resp;
        })
      );

    const sortItems = (sort: Sort) => {
      const data = _items().slice();
      if (!(!sort.active || sort.direction === '')) {
        _items.set(data.sort((a, b) => {
          const aValue = (a as never)[sort.active];
          const bValue = (b as never)[sort.active];
          return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
        }));
      }
    }
    const create = (payload: Partial<T>) =>
      write<T>('post', '', payload).pipe(
        map(resp => {
          upsert(resp);
          console.log(resp);
          return resp;
        })
      );

    const update = (id: Id, payload: Partial<T>) =>
      write<T>('put', `/${id}`, payload).pipe(
        map(resp => {
          upsert(resp);
          console.log(resp);
          return resp;
        })
      );

      const select = (item: T) => {
        _selectedItem.set(item);
        write<T>('patch', `/${item.id}`).pipe(
          map(resp => {
            return resp;
          })
        )
      };
      const edit = (item: T|null) => {
        _editItem.set(item);
      };

    const destroy = (id: Id) =>
      write<null>('delete', `/${id}`).pipe(
        map(() => { remove(id); return null; })
      );

    /* Everything the rest of the app needs */
    return { selectedItem,editItem, items, count, pageInfo, sortItems, list, find, create, update, destroy, select,edit };
  }
}
