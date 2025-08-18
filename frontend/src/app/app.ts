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
    template: `
    <div class="container-fluid">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div class="container-fluid px-3">
          <a class="navbar-brand d-flex align-items-center" routerLink="/">
            <i class="fas fa-book-open me-2"></i>
            <span class="d-none d-sm-inline">BookTracker</span>
            <span class="d-inline d-sm-none">BT</span>
          </a>
    
          <!-- Mobile notifications icon -->
          @if (isAuthenticated$ | async) {
            <div class="d-flex d-lg-none align-items-center">
              <app-notifications class="me-2"></app-notifications>
            </div>
          }
    
          <button
            class="navbar-toggler"
            type="button"
            aria-controls="navbarNav"
            [attr.aria-expanded]="isNavbarOpen"
            aria-label="Toggle navigation"
            (click)="toggleNavbar()">
            <span class="navbar-toggler-icon"></span>
          </button>
    
          <div class="navbar-collapse"
            id="navbarNav"
            [class.collapse]="!isNavbarOpen"
            [class.show]="isNavbarOpen">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link d-flex align-items-center"
                  routerLink="/home"
                  routerLinkActive="active"
                  (click)="closeNavbar()">
                  <i class="fas fa-home me-2 d-lg-none"></i>Home
                </a>
              </li>
              @if (isAuthenticated$ | async) {
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center"
                    routerLink="/library"
                    routerLinkActive="active"
                    (click)="closeNavbar()">
                    <i class="fas fa-book me-2 d-lg-none"></i>My Library
                  </a>
                </li>
              }
              @if (isAuthenticated$ | async) {
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center"
                    routerLink="/books"
                    routerLinkActive="active"
                    (click)="closeNavbar()">
                    <i class="fas fa-search me-2 d-lg-none"></i>Book Catalog
                  </a>
                </li>
              }
              @if (isAuthenticated$ | async) {
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center"
                    routerLink="/social"
                    routerLinkActive="active"
                    (click)="closeNavbar()">
                    <i class="fas fa-users me-2 d-lg-none"></i>Social
                  </a>
                </li>
              }
            </ul>
    
            <ul class="navbar-nav ms-auto">
              <!-- Desktop notifications -->
              @if (isAuthenticated$ | async) {
                <li class="nav-item d-none d-lg-block">
                  <app-notifications></app-notifications>
                </li>
              }
    
              @if (!(isAuthenticated$ | async)) {
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center"
                    routerLink="/login"
                    routerLinkActive="active"
                    (click)="closeNavbar()">
                    <i class="fas fa-sign-in-alt me-2 d-lg-none"></i>Login
                  </a>
                </li>
                <li class="nav-item">
                  <a class="nav-link d-flex align-items-center"
                    routerLink="/register"
                    routerLinkActive="active"
                    (click)="closeNavbar()">
                    <i class="fas fa-user-plus me-2 d-lg-none"></i>Register
                  </a>
                </li>
              } @else {
                <li class="nav-item dropdown" [class.show]="isDropdownOpen">
                  <a class="nav-link dropdown-toggle d-flex align-items-center"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    [attr.aria-expanded]="isDropdownOpen"
                    (click)="toggleDropdown($event)">
                    <i class="fas fa-user-circle me-2"></i>
                    <span class="d-none d-md-inline">{{ (currentUser$ | async)?.username }}</span>
                    <span class="d-inline d-md-none">Account</span>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end" [class.show]="isDropdownOpen">
                    <li>
                      <a class="dropdown-item d-flex align-items-center"
                        routerLink="/profile"
                        (click)="closeDropdown(); closeNavbar()">
                        <i class="fas fa-user me-2"></i>Profile
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item d-flex align-items-center"
                        routerLink="/social"
                        (click)="closeDropdown(); closeNavbar()">
                        <i class="fas fa-users me-2"></i>Social Features
                      </a>
                    </li>
                    @if ((currentUser$ | async)?.isAdmin) {
                      <li>
                        <a class="dropdown-item d-flex align-items-center"
                          routerLink="/admin"
                          (click)="closeDropdown(); closeNavbar()">
                          <i class="fas fa-cog me-2"></i>Admin Panel
                        </a>
                      </li>
                    }
                    <li><hr class="dropdown-divider"></li>
                    <li>
                      <button class="dropdown-item d-flex align-items-center"
                        (click)="logout(); closeDropdown(); closeNavbar()">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              }
    
            </ul>
          </div>
        </div>
      </nav>
    
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    
      <!-- Toast notifications -->
      <app-toast-notifications></app-toast-notifications>
    </div>
    `,
    styles: [`
    .navbar-brand {
      font-weight: bold;
      font-size: 1.5rem;
    }
    
    .nav-link.active {
      font-weight: 500;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 0.375rem;
    }
    
    .dropdown-item {
      cursor: pointer;
      padding: 0.5rem 1rem;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    
    .main-content {
      padding: 1rem;
      min-height: calc(100vh - 76px); /* Account for navbar height */
    }
    
    /* Mobile-specific styles */
    @media (max-width: 991.98px) {
      .navbar-collapse {
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .nav-link {
        padding: 0.75rem 1rem;
        border-radius: 0.375rem;
        margin: 0.125rem 0;
      }
      
      .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      .dropdown-menu {
        border: none;
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      }
    }
    
    @media (max-width: 767.98px) {
      .main-content {
        padding: 0.75rem;
      }
      
      .navbar-brand {
        font-size: 1.25rem;
      }
    }
    
    /* Ensure proper spacing for mobile navigation */
    .navbar-toggler {
      border: none;
      padding: 0.25rem 0.5rem;
    }
    
    .navbar-toggler:focus {
      box-shadow: none;
    }

    /* Dropdown improvements */
    .dropdown {
      position: relative;
    }
    
    .dropdown-menu {
      border: none;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      border-radius: 0.5rem;
      padding: 0.5rem 0;
      z-index: 1050;
      min-width: 200px;
    }

    .dropdown-item {
      padding: 0.5rem 1rem;
      transition: background-color 0.15s ease-in-out;
    }

    .dropdown-item:hover,
    .dropdown-item:focus {
      background-color: #f8f9fa;
    }

    .dropdown-toggle::after {
      margin-left: 0.5rem;
    }

    /* Desktop dropdown positioning */
    @media (min-width: 992px) {
      .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        left: auto;
        transform: none;
        margin-top: 0.125rem;
      }
      
      .dropdown-menu.show {
        display: block;
      }
    }

    /* Mobile dropdown behavior */
    @media (max-width: 991.98px) {
      .dropdown-menu {
        position: static !important;
        transform: none !important;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(255, 255, 255, 0.1);
        margin-top: 0.5rem;
        width: 100%;
        box-shadow: none;
      }

      .dropdown-item {
        color: rgba(255, 255, 255, 0.9);
      }

      .dropdown-item:hover,
      .dropdown-item:focus {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
      }
    }
    
    /* Ensure dropdown doesn't get cut off */
    .navbar {
      overflow: visible;
    }
    
    .navbar-nav {
      overflow: visible;
    }
  `]
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
