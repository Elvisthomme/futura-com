import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

/**
 * Registers a response-interceptor that:
 *   • lets successful replies pass straight through, AND
 *   • if the server answers 401 (Unauthenticated) or 419 (CSRF expired),
 *     runs a caller-supplied logout routine and redirects to /sign-in.
 *
 * Call this ONCE right after you create the Axios instance.
 */
export function attachAuthExpiredInterceptor(
  http: AxiosInstance,
  logoutFn: () => void,
): void {
  http.interceptors.response.use(
    (response: AxiosResponse) => response,          // ✓ happy path
    (error: AxiosError) => {
      const status = error.response?.status ?? 0;

      if (status === 401 || status === 419) {
        logoutFn();                                 // clear tokens / storage
      }
      return Promise.reject(error);                // keep the error chain
    }
  );
}
