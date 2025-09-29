import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthStore, User } from '../../../services/auth-store';
import { Observable } from 'rxjs';
import { NotificationsComponent } from '../../social/notifications/notifications';
import { FallbackImageDirective } from '../../../directives/fallback-image';
import { APP_CONSTANTS } from '../../../constants/app.constants';
import { environment } from '../../../../environments/environment';
import { ClickOutsideDirective } from '../../../directives/click-outside';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AsyncPipe, NotificationsComponent, FallbackImageDirective, ClickOutsideDirective],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isAuthenticated$: Observable<boolean> = this.authStore.isAuthenticated$;
  currentUser$: Observable<User | null> = this.authStore.currentUser$;
  isDropdownOpen = false;
  isNavbarOpen = false;
  readonly avatarPlaceholder = APP_CONSTANTS.DEFAULT_AVATAR_PLACEHOLDER;

  private readonly assetsUrl = environment.assetsUrl;

  constructor(private authStore: AuthStore) {}

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

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleNavbar(): void {
    this.isNavbarOpen = !this.isNavbarOpen;
    if (!this.isNavbarOpen) {
      this.closeDropdown();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  closeNavbar(): void {
    this.isNavbarOpen = false;
    this.closeDropdown();
  }

  handleDropdownOutside(): void {
    this.closeDropdown();
  }

  handleNavbarOutside(): void {
    if (this.isNavbarOpen) {
      this.closeNavbar();
    } else {
      this.closeDropdown();
    }
  }

  logout(): void {
    this.authStore.logout();
    this.closeDropdown();
    this.closeNavbar();
  }
}
