// unit-form.component.ts
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SpinnerService, Unit } from 'src/app/core/core.index';
import { GlobalStore } from 'src/app/store/app.store';
import {
  FormControl,
  Validators,
  FormGroup
} from '@angular/forms';

interface UnitPayload {
  name: string;
  short_name: string;
  status: 'Inactive' | 'Active';
}

@Component({
  selector: 'app-unit-form',
  templateUrl: './unit-form.component.html',
  styleUrls: ['./unit-form.component.scss']
})
export class UnitFormComponent {
  @Output() showSavedSucessMsg = new EventEmitter<void>();
  @Output() showSaveFailMsg = new EventEmitter<void>();
  private readonly globalStore = inject(GlobalStore);
  private readonly spinner = inject(SpinnerService);

  units = this.globalStore.units;

  /** form */
  unitForm = new FormGroup({
    name: new FormControl(this.units.editItem()?.name ?? '', [Validators.required]),
    short_name: new FormControl(this.units.editItem()?.short_name ??'', [Validators.required]),
    status: new FormControl(this.units.editItem()?.status === 'Active' ? true : false , [Validators.required]),
  });

  reloadForm() {
    this.unitForm = new FormGroup({
      name: new FormControl(this.units.editItem()?.name ?? '', [Validators.required]),
      short_name: new FormControl(this.units.editItem()?.short_name ??'', [Validators.required]),
      status: new FormControl(this.units.editItem()?.status === 'Active' ? true : false , [Validators.required]),
    });
  }

  /** alias for template */
  get f() { return this.unitForm.controls; }

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
    return this.unitForm.controls[field].touched && this.unitForm.controls[field].errors?.['required']
  }

  /** submit handler */
  onSubmit(): void {
    this.submitted = true;
    if (this.unitForm.invalid) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const v = this.unitForm.value;

    const payload: UnitPayload = {
      name: v.name!,
      short_name: v.short_name!,
      status: v.status! ? 'Active' : 'Inactive'
    };

    console.log(payload);

    this.unitForm.disable();
    this.spinner.show()
    if (this.units.editItem()!==null) {
      // Update existing unit
      this.units.update(this.units.editItem()!.id, payload).subscribe({
        next: () => {
          this.unitForm.enable();
          this.closeModal();
          this.spinner.hide()
          this.showSavedSucessMsg.emit();
        },
        error: (err) => {
          this.applyServerErrors(err);
          this.unitForm.enable();
          this.spinner.hide()
          this.showSaveFailMsg.emit()
        }
      });
    } else {
      // Create new unit
      this.globalStore.units.create(payload).subscribe({
        next: () => {
          this.unitForm.enable();
          this.closeModal();
          this.spinner.hide()
          this.showSavedSucessMsg.emit();
        },
        error: (err) => {
          this.applyServerErrors(err);
          this.unitForm.enable();
          this.spinner.hide()
          this.showSaveFailMsg.emit()
        }
      });
    }
  }
  private applyServerErrors(error: any) {
    this.unitForm.enable();

    if (error?.status === 422 && error.error?.errors) {
      const serverErrors = error.error.errors as Record<string, string[]>;

      Object.keys(serverErrors).forEach(field => {
        // Try to map Laravel snake_case -> your form control name
        const control = this.unitForm.get(field);
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
    document.querySelector('#add-units .close')?.dispatchEvent(new Event('click'));
  }

}
