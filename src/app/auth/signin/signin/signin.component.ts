import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  Validators,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { routes } from 'src/app/core/helpers/routes';
import { AuthService, LoginPayload } from 'src/app/core/service/auth/auth.service';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signin',
  standalone: true,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, TranslateModule
  ]
})
export class SigninComponent {
  private auth = inject(AuthService);
  private webstorge = inject(WebstorgeService);
  private translate = inject(TranslateService);

  /** page routes for template */
  routes = routes;


  /** show/hide pwd fields */
  show = { password: false };

  /** role list (pulled from API or enum) */

  /** current year for footer */
  currentYear = new Date().getFullYear();

  /** form */
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(true),
  });

  /** alias for template */
  get f() { return this.loginForm.controls; }

  /** guard for showing errors */
  submitted = false;

  togglePassword(): void {
    this.show['password'] = !this.show['password'];
    console.log(this.loginForm)
  }

  /** helpers for template validation classes */
  invalid(name: keyof typeof this.f): boolean {
    const c = this.f[name];
    return (c.touched || this.submitted) && c.invalid;
  }
  valid(name: keyof typeof this.f): boolean {
    const c = this.f[name];
    return (c.touched || this.submitted) && c.valid;
  }

  isRequiredError(field: keyof typeof this.f): boolean {
    return this.loginForm.controls[field].touched && this.loginForm.controls[field].errors?.['required']
  }


  /** submit handler */
  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const v = this.loginForm.value;

    const payload: LoginPayload = {
      email: v.email!,
      password: v.password!
    };

    console.log(payload);

    this.loginForm.disable();
    this.auth.login(payload).subscribe({
      next: () => {
        this.webstorge.login();
      },
      error: (error) => {
        this.loginForm.enable()
        console.log(error)
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: ' btn btn-success',
            cancelButton: 'me-2 btn btn-danger'
          },
          buttonsStyling: false
        })

        if (error.status == 401) {

          swalWithBootstrapButtons.fire(
            this.translate.instant('error'),
            this.translate.instant('invalidCredentials'),
            'error'
          )

        } else {


          swalWithBootstrapButtons.fire(
            this.translate.instant('error'),
            this.translate.instant('unknowError'),
            'error'
          )

        }
      }
    });
  }
}
