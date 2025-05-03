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
import { AuthService, RegisterPayload } from 'src/app/core/auth/auth.service';
import { CommonModule, JsonPipe } from '@angular/common';

const SUBDOMAIN_REGEX = /^[a-z](?:[a-z0-9-]{0,62}[a-z0-9])?$/i;

function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password')?.value;
  const c = group.get('passwordConfirmation')?.value;
  return p && c && p !== c ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule
  ]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  /** page routes for template */
  routes = routes;
  

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
    terms: new FormControl(false, Validators.requiredTrue),
  }, { validators: passwordMatch });

  /** alias for template */
  get f() { return this.registerForm.controls; }

  /** guard for showing errors */
  submitted = false;

  togglePassword(which: 'password' | 'confirm'): void {
    this.show[which] = !this.show[which];
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

    // const payload: RegisterPayload = {
      // username: v.username!,
      // company_name: v.companyName!,
      // company_subdomain: v.companySubdomain!,
      // email: v.email!,
      // password: v.password!,
      // passwordConfirmation: v.passwordConfirmation!
    // };

    this.registerForm.disable();
    // this.auth.register(payload).subscribe({
    //   next: () => this.router.navigate([routes.dashboard]),
    //   error: () => this.registerForm.enable()
    // });
  }
}
