import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from '../core/helpers/routes';


@Injectable({
  providedIn: 'root',
})
export class WebstorgeService {
  private router = inject(Router);

  public login(): void {
    localStorage.setItem('authenticated', 'true');
    this.router.navigate([routes.dashboard]);
  }

  public logout(): void {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('loginTime');
    this.router.navigate([routes.signIn]);
  }
}
