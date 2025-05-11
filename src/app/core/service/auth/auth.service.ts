// src/app/core/auth/auth.service.ts
import { inject, Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CsrfService } from '../csrf/csrf.service';

export interface RegisterPayload {
  username: string;
  company_name: string;
  company_subdomain: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}
export interface ApiResponse<T> { data: T; message: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = axios.create({
    baseURL: environment.apiBaseUrl,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: { Accept: 'application/json' }
  });
  private csrf: CsrfService = inject(CsrfService);
  /* Inject the CsrfService */


  /** POST /api/register */
  register(payload: RegisterPayload): Observable<ApiResponse<unknown>> {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && fd.append(k, v as string | Blob));

    /* 1️⃣  Ensure CSRF cookie, then 2️⃣  run the real request */
    return this.csrf.init().pipe(
      switchMap(() =>
        from(this.http.post<ApiResponse<unknown>>('/api/register', fd))
      ),
      map((resp: AxiosResponse<ApiResponse<unknown>>) => resp.data)
    );
  }


  /** POST /api/login */
  login(payload: LoginPayload): Observable<ApiResponse<unknown>> {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && fd.append(k, v as string | Blob));

    /* 1️⃣  Ensure CSRF cookie, then 2️⃣  run the real request */
    return this.csrf.init().pipe(
      switchMap(() =>
        from(this.http.post<ApiResponse<unknown>>('/api/login', fd))
      ),
      map((resp: AxiosResponse<ApiResponse<unknown>>) => resp.data)
    );
  }

  /* Same pattern for login, logout, etc. */
}
