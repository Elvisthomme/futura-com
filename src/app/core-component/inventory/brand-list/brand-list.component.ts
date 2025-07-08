import { Component, effect, inject, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import {
  routes,
  SidebarService,
  SpinnerService,
  Brand,
} from 'src/app/core/core.index';
import { GlobalStore } from 'src/app/store/app.store';
import Swal from 'sweetalert2';
import { BrandFormComponent } from './brand-form/brand-form.component';

interface data {
  value: string;
}
@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html',
  styleUrl: './brand-list.component.scss',
})
export class BrandListComponent{
  initChecked = false;
  public routes = routes;
  // pagination variables
  // pagination variables
  brands = this.globalStore.brands
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  showFilter = false;
  dataSource = new MatTableDataSource<Brand>();
  public searchDataValue = '';
  @ViewChild(BrandFormComponent) brandForm!: BrandFormComponent;

  constructor(
    private sidebar: SidebarService,
    private globalStore: GlobalStore,
    private spinner: SpinnerService
  ) {
    this.loaadBrands();
    effect(() => {
      this.dataSource.data = this.brands.items();  // always fresh
    });
  }

  loaadBrands() {

    this.spinner.show();
    this.brands.list().subscribe();
  }
  public sortData(sort: Sort) {
    this.brands.sortItems(sort)
  }

  searchData(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  confirmDelete(id: number | string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: ' btn btn-success',
        cancelButton: 'me-2 btn btn-danger',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        confirmButtonText: 'Yes, delete it!',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.brands.destroy(id).subscribe({
            next: () => {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
              );
            },
            error: () => {
              swalWithBootstrapButtons.fire(
                'Failed',
                'Failed to delete brand',
                'error'
              );
            }
          })
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your imaginary file is safe :)',
            'error'
          );
        }
      });
  }

  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';

  selectedList1: data[] = [
    { value: 'Sort by Date' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];
  selectedList2: data[] = [
    { value: 'Choose Brand' },
    { value: 'Lenevo' },
    { value: 'Boat' },
    { value: 'Nike' },
  ];
  selectedList3: data[] = [
    { value: 'Choose Status' },
    { value: 'Active' },
    { value: 'Inactive' },
  ];

  public filter = false;
  openFilter() {
    this.filter = !this.filter;
  }
  isCollapsed: boolean = false;
  toggleCollapse() {
    this.sidebar.toggleCollapse();
    this.isCollapsed = !this.isCollapsed;
  }
  selectAll(initChecked: boolean) {
    if (!initChecked) {
      this.brands.items().forEach((f) => {
        f.is_selected = true;
      });
    } else {
      this.brands.items().forEach((f) => {
        f.is_selected = false;
      });
    }
  }

  addNewBrand() {
    this.brands.edit(null);
  }

  editBrand(brand: Brand) {
    this.brands.edit(brand)
    this.brandForm.reloadForm()
  }

  showSavedSucessMsg() {
    this.messageService.add({
      summary: this.translate.instant('brandForm.successTitle'),
      detail: this.translate.instant('brandForm.successMessage'),
      styleClass: 'success-light-popover',
    });
  }

  showSaveFailMsg() {
    this.messageService.add({
      summary: this.translate.instant('brandForm.failTitle'),
      detail: this.translate.instant('brandForm.failMessage'),
      styleClass: 'danger-light-popover',
    });
  }
}
