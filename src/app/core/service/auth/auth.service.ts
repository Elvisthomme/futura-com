// src/app/core/auth/auth.service.ts
import { inject, Injectable } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CsrfService } from '../csrf/csrf.service';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { attachAuthExpiredInterceptor } from '../../interceptors/axios-auth-expired.interceptor';
import { User } from '../../core.index';

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
  private readonly csrf = inject(CsrfService);
  private readonly webstorage = inject(WebstorgeService);

  constructor() {
    attachAuthExpiredInterceptor(
      this.http,
      () => this.webstorage.logout(),   // or this.runLocalLogoutSideEffects()
    );
  }
  /** POST /api/register */
  register(payload: RegisterPayload): Observable<User> {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && fd.append(k, v as string | Blob));

    /* 1️⃣  Ensure CSRF cookie, then 2️⃣  run the real request */
    return this.csrf.init().pipe(
      switchMap(() =>
        from(this.http.post<User>('/api/register', fd))
      ),
      map((resp: AxiosResponse<User>) => resp.data)
    );
  }


  /** POST /api/login */
  login(payload: LoginPayload): Observable<User> {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => v != null && fd.append(k, v as string | Blob));

    /* 1️⃣  Ensure CSRF cookie, then 2️⃣  run the real request */
    return this.csrf.init().pipe(
      switchMap(() =>
        from(this.http.post<User>('/api/login', fd))
      ),
      map((resp: AxiosResponse<User>) => {
        console.log(resp.data);
        return resp.data;
      })
    );
  }

  /** POST /api/login */
  logout(): Observable<""> {

    /* 1️⃣  Ensure CSRF cookie, then 2️⃣  run the real request */
    return this.csrf.init().pipe(
      switchMap(() =>
        from(this.http.post<"">('/api/logout'))
      ),
      map((resp: AxiosResponse<"">) => {
        console.log(resp);
        return "";
      })
    );
  }

}
