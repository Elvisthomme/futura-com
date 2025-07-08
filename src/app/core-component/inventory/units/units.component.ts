import { GlobalStore } from 'src/app/store/app.store';
import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SidebarService, SpinnerService, Unit, } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import Swal from 'sweetalert2';
import { UnitFormComponent } from './unit-form/unit-form.component';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

interface data {
  value: string;
}

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss'
})
export class UnitsComponent {
  public selectedValue1 = '';
  public selectedValue2 = '';
  public selectedValue3 = '';
  public routes = routes;
  @ViewChild(UnitFormComponent) unitForm!: UnitFormComponent;



  public cartValue = [4, 4];

  public addPos(i: number): void {
    this.cartValue[i]++;
  }
  public reducePos(i: number): void {
    this.cartValue[i]--;
  }


  // pagination variables
  units = this.globalStore.units
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  showFilter = false;
  dataSource = new MatTableDataSource<Unit>();
  public searchDataValue = '';
  //** / pagination variables
  constructor(
    private sidebar: SidebarService,
    private globalStore: GlobalStore,
    private spinner: SpinnerService
  ) {
    // kick-off the first fetch – after that everything is reactive
    this.loaadUnits();
    effect(() => {
      this.dataSource.data = this.units.items();  // always fresh
    });

  }

  loaadUnits() {

    this.spinner.show();
    this.units.list().subscribe();
  }
  initChecked = false;
  public sortData(sort: Sort) {
    this.units.sortItems(sort)
  }

  searchData(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  selectedList3: data[] = [
    { value: 'Sort by Date' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];
  selectedList1: data[] = [
    { value: 'Choose Status' },
    { value: this.translate.instant('units.statuses.active') },
    { value: this.translate.instant('units.statuses.inactive') },
  ];
  selectedList2: data[] = [
    { value: 'Choose Unit' },
    ...this.units.items().map(unit => {
      return {
        value: unit.name
      }
    }),
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
          this.units.destroy(id).subscribe({
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
                'Failed to delete unit',
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
  selectAll(initChecked: boolean) {
    if (!initChecked) {
      this.units.items().forEach((f) => {
        f.is_selected = true;
      });
    } else {
      this.units.items().forEach((f) => {
        f.is_selected = false;
      });
    }
  }


  addNewUnit() {
    this.units.edit(null);
  }

  editUnit(unit: Unit) {
    this.units.edit(unit)
    this.unitForm.reloadForm()
  }

  showSavedSucessMsg() {
    this.messageService.add({
      summary: this.translate.instant('unitForm.successTitle'),
      detail: this.translate.instant('unitForm.successMessage'),
      styleClass: 'success-light-popover',
    });
  }

  showSaveFailMsg() {
    this.messageService.add({
      summary: this.translate.instant('unitForm.failTitle'),
      detail: this.translate.instant('unitForm.failMessage'),
      styleClass: 'danger-light-popover',
    });
  }
}
