// src/app/core/auth/auth.service.ts
import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface RegisterPayload {
  username: string;
  company_name: string;
  company_subdomain: string;
  email: string;
  password: string;
  password_confirmation: string;
  /* …optional extras… */
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http: AxiosInstance = axios.create({
    baseURL: environment.apiBaseUrl,
    withCredentials: true,
    headers: { Accept: 'application/json' }
  });

  /** POST /api/register */
  register(payload: RegisterPayload): Observable<ApiResponse<unknown>> {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        fd.append(k, v as string | Blob);
      }
    });

    return from(
      this.http.post<ApiResponse<unknown>>('/api/register', fd)
    ).pipe(
      map((resp: AxiosResponse<ApiResponse<unknown>>) => resp.data)
    );
  }

  /* other auth methods */
}
