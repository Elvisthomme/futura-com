import { WebstorgeService } from './shared/webstorge.service';
import { Component } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  Event as RouterEvent,
} from '@angular/router';
import { SpinnerService } from './core/core.index';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'template';
  public page = '';

  constructor(private router: Router, private spinner: SpinnerService,private translate: TranslateService,private webstorage: WebstorgeService) {

    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang(webstorage.getDefaultLang());
    this.translate.use(webstorage.getDefaultLang());
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        const URL = event.url.split('/');
        this.page = URL[1];
        this.spinner.show();
      }
      if (event instanceof NavigationEnd) {
        this.spinner.hide();
      }
    });

    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationStart) {
        this.spinner.show();
      }
      if (event instanceof NavigationEnd) {
        this.spinner.hide();
      }
    });
  }
}
