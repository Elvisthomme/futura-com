import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexXAxis,
  ApexResponsive,
  ApexLegend,
  ApexFill,
  ChartComponent,
} from 'ng-apexcharts';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

import { routes } from 'src/app/core/helpers/routes';
import { CommonService } from 'src/app/core/service/common/common.service';
import { DataService } from 'src/app/core/service/data/data.service';
import { SettingsService } from 'src/app/core/service/settings/settings.service';
import {
  DashboardMetrics,
} from 'src/app/core/service/dashboard/dashboard.service';
import { DashboardService } from 'src/app/core/service/dashboard/dashboard.service';
import { Product } from 'src/app/core/core.index';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  colors: string[];
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  legend: ApexLegend;
  fill: ApexFill;
};

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  /* ─────────────────────────────────────── Widgets & chart ────────────────── */
  public dashboardMetrics: DashboardMetrics = this.dashboard.dashboardMetricsData();
  public currency: string = "";
  public countUpOptions = { duration: 1.6 };

  years: number[] = [];
  selectedYear: number = new Date().getFullYear();

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> = {
    /* baseline; will be updated in prepareChart() */
    series: [],
    colors: ['#28C76F', '#EA5455'],
    chart: {
      type: 'bar',
      height: 320,
      stacked: true,
      zoom: { enabled: true },
    },
    responsive: [
      {
        breakpoint: 280,
        options: {
          legend: { position: 'bottom', offsetY: 0 },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'all',
        columnWidth: '20%',
      },
    },
    dataLabels: { enabled: false },
    yaxis: {
      min: -200,
      max: 300,
      tickAmount: 5,
    },
    xaxis: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
    legend: { show: false },
    fill: { opacity: 1 },
  };

  /* ─────────────────────────────────────── Table / pagination ─────────────── */
  public expiredProducts: (Product & { is_selected?: boolean })[] = this.dashboard.dashboardMetricsData().recently_expired_products;
  showFilter = false;
  dataSource!: MatTableDataSource<(Product & { is_selected?: boolean })>;
  public searchDataValue = '';
  initChecked = false;

  /* Helpers */
  public routes = routes;

  constructor(
    private common: CommonService,
    private setting: SettingsService,
    private data: DataService,
    private router: Router,
    private dashboard: DashboardService,
    private translate: TranslateService
  ) {
  }

  /* ────────────────────────────────────────── Init ────────────────────────── */
  ngOnInit(): void {
    /* currency observable */
    this.common.currency$.subscribe((res) => (this.currency = res));

    /* fetch dashboard API payload */
    this.fetchMetrics();

  }

  /* ───────────────────────────── Dashboard payload ────────────────────────── */
  private fetchMetrics(): void {
    this.dashboard.getDashboardMetrics().subscribe(() => {

      this.prepareYearData();
      this.prepareChart();

      this.dataSource = new MatTableDataSource<(Product & { is_selected?: boolean })>(this.expiredProducts);

    });
  }

  private prepareYearData(): void {
    this.years = Object.keys(this.dashboardMetrics.sales)
      .map(Number)
      .sort((a, b) => b - a);
    this.selectedYear = this.years[0];
  }

  private prepareChart(): void {
    const sales = Object.values(
      this.dashboardMetrics.sales[this.selectedYear]
    ).map((v) => this.toNumber(v));

    const purchases = Object.values(
      this.dashboardMetrics.purchases[this.selectedYear]
    ).map((v) => -this.toNumber(v));

    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          name: this.translate.instant('dashboard.sales'),
          data: sales,
        },
        {
          name: this.translate.instant('dashboard.purchase'),
          data: purchases,
        },
      ],
    };
  }

  changeYear(year: number): void {
    if (year !== this.selectedYear) {
      this.selectedYear = year;
      this.prepareChart();
    }
  }

  /* ─────────────────────────────── Count-up util ─────────────────────────── */
  toNumber(value: string | number | null | undefined): number {
    return Number(value) || 0;
  }


  /* ─────────────────────────────────── SweetAlert ─────────────────────────── */
  confirmColor(): void {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'me-2 btn btn-danger',
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('dashboard.areYouSure'),
        text: this.translate.instant('dashboard.cannotRevert'),
        confirmButtonText: this.translate.instant('dashboard.yesDelete'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('dashboard.cancel'),
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire(
            this.translate.instant('dashboard.deleted'),
            this.translate.instant('dashboard.fileDeleted'),
            'success'
          );
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            this.translate.instant('dashboard.cancelled'),
            this.translate.instant('dashboard.fileSafe'),
            'error'
          );
        }
      });
  }

  /* select / deselect all rows */
  selectAll(initChecked: boolean): void {
    if (!initChecked) {
      this.expiredProducts.forEach((f) => (f.is_selected = true));
    } else {
      this.expiredProducts.forEach((f) => (f.is_selected = false));
    }
  }
}
