import { GlobalStore } from 'src/app/store/app.store';
import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NavigationEnd, Router } from '@angular/router';
import { SidebarService, SpinnerService, Unit, apiResultFormat } from 'src/app/core/core.index';
import { routes } from 'src/app/core/helpers/routes';
import { DataService } from 'src/app/core/service/data/data.service';
import { unit } from 'src/app/shared/model/page.model';
import { PaginationService, pageSelection, tablePageSize } from 'src/app/shared/shared.index';
import Swal from 'sweetalert2';
import { Pagination } from 'src/app/store/rest.store';
import { UnitFormComponent } from './unit-form/unit-form.component';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';

interface data {
  value: string;
}

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrl: './units.component.scss'
})
export class UnitsComponent implements OnInit {
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
  }
  ngOnInit(): void {
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
    { value: 'Sort by Datee' },
    { value: 'Newest' },
    { value: 'Oldest' },
  ];
  selectedList1: data[] = [
    { value: 'Choose Status' },
    { value: 'Active' },
    { value: 'Inactive' },
  ];
  selectedList2: data[] = [
    { value: 'Choose Unit' },
    { value: 'Piece' },
    { value: 'Kilogram' },
    { value: 'Gram' },
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
  confirmColor() {
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
          swalWithBootstrapButtons.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
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
