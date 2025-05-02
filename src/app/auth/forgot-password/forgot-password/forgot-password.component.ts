import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  public routes = routes;
  public currentYear: number = new Date().getFullYear();
  constructor(private router: Router) {}

  navigation() {
    this.router.navigate([routes.signIn])
  }
}
