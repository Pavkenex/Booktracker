import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthStore, User } from './services/auth-store';
import { NotificationsComponent } from './components/social/notifications/notifications';
import { ToastNotificationsComponent } from './components/shared/toast-notifications/toast-notifications';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, RouterModule, NotificationsComponent, ToastNotificationsComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'booktracker-frontend';
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  isDropdownOpen = false;
  isNavbarOpen = false;

  constructor(
    private authStore: AuthStore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isAuthenticated$ = this.authStore.isAuthenticated$;
    this.currentUser$ = this.authStore.currentUser$;
  }

  ngOnInit(): void {
    // Authentication state is initialized in the AuthStore constructor
  }

  ngAfterViewInit(): void {
    // Set up click outside listener for dropdown and navbar
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('click', (event) => {
        const target = event.target as Element;
        
        // Close dropdown if clicking outside
        if (!target.closest('.dropdown') && this.isDropdownOpen) {
          this.isDropdownOpen = false;
        }
        
        // Close navbar if clicking outside on mobile
        if (!target.closest('.navbar') && this.isNavbarOpen) {
          this.isNavbarOpen = false;
        }
      });
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

  logout(): void {
    this.authStore.logout();
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  closeNavbar(): void {
    this.isNavbarOpen = false;
  }
}
