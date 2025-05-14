import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './inventory.component';
import { sharedModule } from 'src/app/shared/shared.module';
import { BarcodeComponent } from './barcode/barcode.component';
import { WarrantyComponent } from './warranty/warranty.component';
import { BrandListComponent } from './brand-list/brand-list.component';
import { UnitsComponent } from './units/units.component';
import { VarriantAttributesComponent } from './varriant-attributes/varriant-attributes.component';
import { QrcodeComponent } from './qrcode/qrcode.component';
import { UnitFormComponent } from './units/unit-form/unit-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';



@NgModule({
  declarations: [
    InventoryComponent,
    BarcodeComponent,
    WarrantyComponent,
    BrandListComponent,
    UnitFormComponent,
    UnitsComponent,
    VarriantAttributesComponent,
    QrcodeComponent
  ],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    sharedModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  providers: [MessageService],

})
export class InventoryModule { }
