import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SpinnerService } from 'src/app/core/core.index';
import { GlobalStore } from 'src/app/store/app.store';


interface BrandPayload {
  name: string;
  image_url: string;
  state: 'Inactive' | 'Active';
}

@Component({
  selector: 'app-brand-form',
  templateUrl: './brand-form.component.html',
  styleUrl: './brand-form.component.scss'
})
export class BrandFormComponent {
  @Output() showSavedSucessMsg = new EventEmitter<void>();
  @Output() showSaveFailMsg = new EventEmitter<void>();
  private readonly globalStore = inject(GlobalStore);
  private readonly spinner = inject(SpinnerService);

  brands = this.globalStore.brands;

  /** form */
  brandForm = new FormGroup({
    name: new FormControl(this.brands.editItem()?.name ?? '', [Validators.required]),
    image_url: new FormControl(this.brands.editItem()?.image_url ?? '', [Validators.required]),
    state: new FormControl(this.brands.editItem()?.state === 'Active' ? true : false, [Validators.required]),
  });

  reloadForm() {
    this.brandForm = new FormGroup({
      name: new FormControl(this.brands.editItem()?.name ?? '', [Validators.required]),
      image_url: new FormControl(this.brands.editItem()?.image_url ?? '', [Validators.required]),
      state: new FormControl(this.brands.editItem()?.state === 'Active' ? true : false, [Validators.required]),
    });
  }

  /** alias for template */
  get f() { return this.brandForm.controls; }

  /** guard for showing errors */
  submitted = false;

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
    return this.brandForm.controls[field].touched && this.brandForm.controls[field].errors?.['required']
  }

  /** submit handler */
  onSubmit(): void {
    this.submitted = true;
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    const v = this.brandForm.value;

    const payload: BrandPayload = {
      name: v.name!,
      image_url: v.image_url!,
      state: v.state! ? 'Active' : 'Inactive'
    };

    console.log(payload);

    this.brandForm.disable();
    this.spinner.show()
    if (this.brands.editItem() !== null) {
      // Update existing brand
      this.brands.update(this.brands.editItem()!.id, payload).subscribe({
        next: () => {
          this.brandForm.enable();
          this.closeModal();
          this.spinner.hide()
          this.showSavedSucessMsg.emit();
        },
        error: (err) => {
          this.applyServerErrors(err);
          this.brandForm.enable();
          this.spinner.hide()
          this.showSaveFailMsg.emit()
        }
      });
    } else {
      // Create new brand
      this.globalStore.brands.create(payload).subscribe({
        next: () => {
          this.brandForm.enable();
          this.closeModal();
          this.spinner.hide()
          this.showSavedSucessMsg.emit();
        },
        error: (err) => {
          this.applyServerErrors(err);
          this.brandForm.enable();
          this.spinner.hide()
          this.showSaveFailMsg.emit()
        }
      });
    }
  }
  private applyServerErrors(error: any) {
    this.brandForm.enable();

    if (error?.status === 422 && error.error?.errors) {
      const serverErrors = error.error.errors as Record<string, string[]>;

      Object.keys(serverErrors).forEach(field => {
        // Try to map Laravel snake_case -> your form control name
        const control = this.brandForm.get(field);
        if (control) {
          control.setErrors({
            server: serverErrors[field][0]      // keep only the first message
          });
        }
      });
    } else {
      // fallback – toast / snackbar / banner
      console.error(error);
    }
  }
  private closeModal() {
    document.querySelector('#add-brands .close')?.dispatchEvent(new Event('click'));
  }

}
