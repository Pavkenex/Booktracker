import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthStore, User } from '../../../services/auth-store';
import { Observable } from 'rxjs';
import { NotificationsComponent } from '../../social/notifications/notifications';
import { FallbackImageDirective } from '../../../directives/fallback-image';
import { APP_CONSTANTS } from '../../../constants/app.constants';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AsyncPipe, NotificationsComponent, FallbackImageDirective],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  isAuthenticated$: Observable<boolean> = this.authStore.isAuthenticated$;
  currentUser$: Observable<User | null> = this.authStore.currentUser$;
  isDropdownOpen = false;
  isNavbarOpen = false;
  readonly avatarPlaceholder = APP_CONSTANTS.DEFAULT_AVATAR_PLACEHOLDER;

  private readonly assetsUrl = environment.assetsUrl;
  private documentClickListener?: (event: Event) => void;

  constructor(
    private authStore: AuthStore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getAvatarSrc(user: User | null | undefined): string {
    const avatarUrl = user?.avatarUrl;

    if (!avatarUrl) {
      return this.avatarPlaceholder;
    }

    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }

    const prefix = avatarUrl.startsWith('/') ? '' : '/';
    return `${this.assetsUrl}${prefix}${avatarUrl}`;
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.documentClickListener = (event: Event) => {
        const target = event.target as Element;

        if (!target.closest('.dropdown') && this.isDropdownOpen) {
          this.isDropdownOpen = false;
        }

        if (!target.closest('.navbar') && this.isNavbarOpen) {
          this.isNavbarOpen = false;
        }
      };

      document.addEventListener('click', this.documentClickListener);
    }
  }

  ngOnDestroy(): void {
    if (this.documentClickListener && isPlatformBrowser(this.platformId)) {
      document.removeEventListener('click', this.documentClickListener);
    }
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleNavbar(): void {
    this.isNavbarOpen = !this.isNavbarOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  closeNavbar(): void {
    this.isNavbarOpen = false;
  }

  logout(): void {
    this.authStore.logout();
    this.closeDropdown();
    this.closeNavbar();
  }
}
