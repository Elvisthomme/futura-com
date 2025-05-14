import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  Validators,
  ValidationErrors,
  AbstractControl,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { routes } from 'src/app/core/helpers/routes';
import { AuthService, RegisterPayload } from 'src/app/core/service/auth/auth.service';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import {TranslateModule} from "@ngx-translate/core";
import Swal from 'sweetalert2';

const SUBDOMAIN_REGEX = /^[a-z](?:[a-z0-9-]{0,62}[a-z0-9])?$/i;

export function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password')?.value;
  const c = group.get('password_confirmation')?.value;
  return p && c && p !== c ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,TranslateModule
  ]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  /** page routes for template */
  routes = routes;

  constructor(private translate: TranslateService,private webstorage: WebstorgeService) {

    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang(webstorage.getDefaultLang());
    this.translate.use(webstorage.getDefaultLang());
  }

  /** show/hide pwd fields */
  show = { password: false, confirm: false };

  /** role list (pulled from API or enum) */

  /** current year for footer */
  currentYear = new Date().getFullYear();

  /** form */
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(4)]),
    company_name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    company_subdomain: new FormControl('', [Validators.required,Validators.minLength(3),Validators.pattern(SUBDOMAIN_REGEX)]),
    email: new FormControl('', [Validators.required,Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    password_confirmation: new FormControl('', Validators.required),
    terms: new FormControl(true, Validators.requiredTrue),
  }, { validators: passwordMatch });

  /** alias for template */
  get f() { return this.registerForm.controls; }

  /** guard for showing errors */
  submitted = false;

  togglePassword(which: 'password' | 'confirm'): void {
    this.show[which] = !this.show[which];
    console.log(this.registerForm)
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

  isRequiredError(field: keyof typeof this.f):boolean {
    return this.registerForm.controls[field].touched && this.registerForm.controls[field].errors?.['required']
  }

  ispasswordMismatch():boolean {
    return this.registerForm.hasError('passwordMismatch') && this.registerForm.controls['password'].touched && this.registerForm.controls['password_confirmation'].touched
  }

  isMinLengthError(field: keyof typeof this.f): boolean{
    return this.registerForm.controls[field].touched &&  this.registerForm.controls[field].errors?.['minLength']
  }


  /** submit handler */
  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const v = this.registerForm.value;

    const payload: RegisterPayload = {
      username: v.username!,
      company_name: v.company_name!,
      company_subdomain: v.company_subdomain!,
      email: v.email!,
      password: v.password!,
      password_confirmation: v.password_confirmation!,
      terms: v.terms!
    };

    console.log(payload);

    this.registerForm.disable();
    this.auth.register(payload).subscribe({
      next: () => {
        this.webstorage.login();
      },
      error: (error) => {
              this.registerForm.enable()
              console.log(error)
              const swalWithBootstrapButtons = Swal.mixin({
                customClass: {
                  confirmButton: ' btn btn-success',
                  cancelButton: 'me-2 btn btn-danger'
                },
                buttonsStyling: false
              })

                swalWithBootstrapButtons.fire(
                  this.translate.instant('error'),
                  error.data,
                  'error'
                )

            }
    });
  }
}
