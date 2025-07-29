import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService, User } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="container-fluid">
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
          <a class="navbar-brand" routerLink="/">BookTracker</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/home" routerLinkActive="active">Home</a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated$ | async">
                <a class="nav-link" routerLink="/library" routerLinkActive="active">My Library</a>
              </li>
              <li class="nav-item" *ngIf="isAuthenticated$ | async">
                <a class="nav-link" routerLink="/books" routerLinkActive="active">Book Catalog</a>
              </li>
            </ul>
            <ul class="navbar-nav ms-auto">
              <ng-container *ngIf="!(isAuthenticated$ | async); else authenticatedNav">
                <li class="nav-item">
                  <a class="nav-link" routerLink="/login" routerLinkActive="active">Login</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" routerLink="/register" routerLinkActive="active">Register</a>
                </li>
              </ng-container>
              <ng-template #authenticatedNav>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" 
                     data-bs-toggle="dropdown" aria-expanded="false">
                    {{ (currentUser$ | async)?.username }}
                  </a>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" routerLink="/profile">Profile</a></li>
                    <li><a class="dropdown-item" routerLink="/friends">Friends</a></li>
                    <li *ngIf="(currentUser$ | async)?.isAdmin">
                      <a class="dropdown-item" routerLink="/admin">Admin Panel</a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item" (click)="logout()">Logout</button></li>
                  </ul>
                </li>
              </ng-template>
            </ul>
          </div>
        </div>
      </nav>
      
      <main class="container mt-4">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .navbar-brand {
      font-weight: bold;
      font-size: 1.5rem;
    }
    
    .nav-link.active {
      font-weight: 500;
    }
    
    .dropdown-item {
      cursor: pointer;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'booktracker-frontend';
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Authentication state is initialized in the AuthService constructor
  }

  logout(): void {
    this.authService.logout();
  }
}