// src/app/core/auth/csrf.service.ts
import { Injectable } from '@angular/core';
import axios from 'axios';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/**
 *  A tiny service whose only job is to ensure the browser
 *  receives the XSRF-TOKEN cookie from Laravel Sanctum.
 */
@Injectable({ providedIn: 'root' })
export class CsrfService {
  private readonly http = axios.create({
    baseURL: environment.apiBaseUrl,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: { Accept: 'application/json' }
  });

  /**
   * Hit /sanctum/csrf-cookie and expose the result as an Observable.
   * You usually call this once per browser session.
   */
  init(): Observable<void> {
    return from(this.http.get('/sanctum/csrf-cookie')).pipe(
      map(() => void 0)   // we only care that it resolved
    );
  }
}
