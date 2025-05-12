// src/app/core/auth/auth.service.ts
import { inject, Injectable, signal, computed } from '@angular/core';
import axios, { AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CsrfService } from '../csrf/csrf.service';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { attachAuthExpiredInterceptor } from '../../interceptors/axios-auth-expired.interceptor';
import { createDefaultUser, User, Store } from '../../core.index';

export interface DashBoardHeaderData {
  user: User,
  notification_count: number | null,
  message_count: number | null,
  stores: Store[]
}

export interface LoginPayload {
  email: string;
  password: string;
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
  private _data = signal<DashBoardHeaderData>(this.createDefaultDashBoardHeaderData());

  /* derived helpers */
  public data = computed(() => this._data());
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
        this._data.set(resp.data);
        return resp.data
      })
    );
  }
}
