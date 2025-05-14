import { Product } from './../../../../core/models/models';
import { GlobalStore } from 'src/app/store/app.store';
import { Component, inject, OnInit } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { routes } from 'src/app/core/helpers/routes';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
export class ProductDetailsComponent implements OnInit {
  public routes = routes;
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="fas fa-chevron-left"></i>',
      '<i class="fas fa-chevron-right"></i>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
    },
    nav: true,
  };
  id!: number;
  readonly globalStore = inject(GlobalStore);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  product: Product | null = null;
  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : NaN;

    if (isNaN(this.id)) {
      this.router.navigate([routes.error404]);
      return;
    }

    this.route.paramMap.subscribe(params => {
      const param = params.get('id');
      this.id = param ? +param : NaN;
      if (!isNaN(this.id)) {
        this.globalStore.products.find(this.id).subscribe((res) => {
          if (res) {
            this.product = res;
          } else {
            this.router.navigate([routes.error404]);
          }
        });
      } else {
        this.router.navigate([routes.error404]);
      }
    });
  }
}
