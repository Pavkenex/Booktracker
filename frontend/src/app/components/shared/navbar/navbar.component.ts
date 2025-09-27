import { AfterViewInit, Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthStore, User } from '../../../services/auth-store';
import { Observable } from 'rxjs';
import { NotificationsComponent } from '../../social/notifications/notifications';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AsyncPipe, NotificationsComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit, OnDestroy {
  isAuthenticated$: Observable<boolean> = this.authStore.isAuthenticated$;
  currentUser$: Observable<User | null> = this.authStore.currentUser$;
  isDropdownOpen = false;
  isNavbarOpen = false;

  private documentClickListener?: (event: Event) => void;

  constructor(
    private authStore: AuthStore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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
