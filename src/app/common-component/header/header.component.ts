import { Component } from '@angular/core';
import { NavigationStart, Router, Event as RouterEvent } from '@angular/router';
import { CommonService, SidebarService, Store } from 'src/app/core/core.index';
import { WebstorgeService } from 'src/app/shared/webstorge.service';
import { routes } from 'src/app/core/helpers/routes';
import { AuthService } from 'src/app/core/service/auth/auth.service';
import Swal from 'sweetalert2';
import { GlobalStore } from 'src/app/store/app.store';
import { DashboardService } from 'src/app/core/service/dashboard/dashboard.service';
import { TranslateService } from '@ngx-translate/core';

interface Language {
  code: 'en'|'fr';
  label: string;
  flag: string;
}
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  public routes = routes;
  activePath = '';
  showSearch = false;
  public changeLayout = '1';
  public darkTheme = false;
  public logoPath = '';
  public miniSidebar = false;
  elem = document.documentElement;
  public addClass = false;
  base = '';
  page = '';
  last = '';


  languages: Language[] = [
    { code: 'en', label: 'English', flag: "assets/img/flags/us.png" },
    { code: 'fr', label: 'Français', flag: "assets/img/flags/fr.png" },
  ];
  selectedLanguage: Language = this.webStorage.getDefaultLang() === 'fr' ? this.languages[1] : this.languages[0];

  get userName(): string {
    return this.dashboard.headerData().user.username;
  }
  get stores(): Store[] {
    return this.globalStore.stores.items();
  }
  get selectedStore(): Store | null {
    return this.globalStore.stores.selectedItem();
  }
  get notificationCount(): number | null {
    return this.dashboard.headerData().notification_count;
  }
  get messageCount(): number | null {
    return this.dashboard.headerData().message_count;
  }
  get userImage(): string | null | undefined {
    return this.dashboard.headerData().user.image_url;
  }
  get userStoreRole(): string | null | undefined {
    return "Super Admin";
  }

  selectStore(store: Store) {
    this.globalStore.stores.select(store)
  }
  selectLanguage(event:Event, language: Language): void {

    event.preventDefault();
    if (this.selectedLanguage.code !== language.code) {
      this.webStorage.setDefaultLang(language.code);
      this.selectedLanguage = language;
      this.translateService.use(language.code);
    }
    const currentLanguage = this.translateService.currentLang;
    console.log('currentLanguage', currentLanguage);
  }

  constructor(
    private Router: Router,
    private common: CommonService,
    private sidebar: SidebarService,
    private webStorage: WebstorgeService,
    private auth: AuthService,
    private globalStore: GlobalStore,
    private dashboard: DashboardService,
    private translateService: TranslateService
  ) {
    dashboard.getHeader().subscribe({
      next: () => {
      },
      error: (error) => {
        console.log(error)
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: ' btn btn-success',
            cancelButton: 'me-2 btn btn-danger'
          },
          buttonsStyling: false
        })

        swalWithBootstrapButtons.fire(
          this.translateService.instant('error'),
          this.translateService.instant('failedToLoadUserInfos'),
          'error'
        )
      }
    })
    globalStore.stores.list().subscribe({
      next: () => {
      },
      error: (error) => {
        console.log(error)
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: ' btn btn-success',
            cancelButton: 'me-2 btn btn-danger'
          },
          buttonsStyling: false
        })

        swalWithBootstrapButtons.fire(
          this.translateService.instant('error'),
          this.translateService.instant('failedToLogout'),
          'error'
        )

      }
    })
    this.activePath = this.Router.url.split('/')[2];
    this.Router.events.subscribe((data: RouterEvent) => {
      if (data instanceof NavigationStart) {
        this.activePath = data.url.split('/')[2];
      }
    });
    this.sidebar.sideBarPosition.subscribe((res: string) => {
      if (res == 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    this.common.base.subscribe((base: string) => {
      this.base = base;
    });
    this.common.page.subscribe((page: string) => {
      this.page = page;
    });
    this.common.last.subscribe((last: string) => {
      this.last = last;
    });
  }

  public toggleSidebar(): void {
    this.sidebar.switchSideMenuPosition();
  }

  public togglesMobileSideBar(): void {
    this.sidebar.switchMobileSideBarPosition();
  }

  public miniSideBarMouseHover(position: string): void {
    if (position == 'over') {
      this.sidebar.expandSideBar.next(true);
    } else {
      this.sidebar.expandSideBar.next(false);
    }
  }

  fullscreen() {
    if (!document.fullscreenElement) {
      this.elem.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  onLogout(event: Event): void {
    event.preventDefault();
    this.auth.logout().subscribe({
      next: () => {
        this.webStorage.logout();
      },
      error: (error) => {
        console.log(error)
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: ' btn btn-success',
            cancelButton: 'me-2 btn btn-danger'
          },
          buttonsStyling: false
        })
        this.translateService
          .get(['failedToLogout', 'error'])
          .subscribe((translations: { [key: string]: string }) => {
            swalWithBootstrapButtons.fire(
              translations['error'],
              translations['failedToLogout'],
              'error'
            );
          });

      }
    });
  }
}
