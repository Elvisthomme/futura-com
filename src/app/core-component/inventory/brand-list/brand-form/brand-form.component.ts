import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SpinnerService } from 'src/app/core/core.index';
import { GlobalStore } from 'src/app/store/app.store';


interface BrandPayload {
  name: string;
  image_url: string;
  status: 'Inactive' | 'Active';
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
  private readonly messageService = inject(MessageService);

  brands = this.globalStore.brands;

  imageFile: File | null = null;       // <— selected file
  previewUrl: string | null = null;    // <— src for <img>
  showPlaceholder = true;              // <— controls the plus icon

  /** form */
  brandForm = new FormGroup({
    name: new FormControl(this.brands.editItem()?.name ?? '', [Validators.required]),
    status: new FormControl(this.brands.editItem()?.status === 'Active' ? 'true' : 'false', [Validators.required]),
  });

  reloadForm() {
    this.brandForm = new FormGroup({
      name: new FormControl(this.brands.editItem()?.name ?? '', [Validators.required]),
      status: new FormControl(this.brands.editItem()?.status === 'Active' ? 'true' : 'false', [Validators.required]),
    });
    if (this.brands.editItem()?.image_url) {
      this.previewUrl =  this.brands.editItem()!.image_url!;
      this.showPlaceholder = false;
    }
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

  onFileSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  
    if (!file) {
      return;
    }
  
    // ✅ Validate file size (max 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      this.messageService.add({
        summary: 'Fail to upload',
        detail: 'The selected image is too large. Maximum size is 2MB (2048 KB).',
        styleClass: 'danger-light-popover',
      });
      return;
    }
  
    this.imageFile = file;
  
    const reader = new FileReader();
    reader.readAsDataURL(this.imageFile);
    reader.onload = (ev: ProgressEvent<FileReader>) => {
      this.previewUrl = ev.target?.result as string | null;
      if (this.previewUrl) {
        this.showPlaceholder = false;
      }
    };
  }
  /** submit handler */
  onSubmit(): void {
    this.submitted = true;
    if (this.brandForm.invalid) {
      this.brandForm.markAllAsTouched();
      return;
    }

    this.brandForm.disable();
    this.spinner.show()
    const v = this.brandForm.value;

    const fd = new FormData();
    fd.append('name', v.name!);
    fd.append('status', v.status ? 'Active' : 'Inactive');
    if (this.imageFile) {
      fd.append('image_url', this.imageFile);   // <-- key must match Laravel field
    }

    // 2. call the store (cast keeps TypeScript happy)
    const call = this.brands.editItem()
      ? this.brands.update(this.brands.editItem()!.id, fd as unknown as Partial<BrandPayload>)
      : this.brands.create(fd as unknown as Partial<BrandPayload>);


    console.log(fd);

    if (this.brands.editItem() !== null) {
      // Update existing brand
      call.subscribe({
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
      call.subscribe({
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
