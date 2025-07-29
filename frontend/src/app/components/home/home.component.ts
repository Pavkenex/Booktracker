import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="row">
      <div class="col-12">
        <div class="jumbotron bg-light p-5 rounded">
          <h1 class="display-4">
            <span *ngIf="!(isAuthenticated$ | async)">Welcome to BookTracker</span>
            <span *ngIf="isAuthenticated$ | async">Welcome back, {{ (currentUser$ | async)?.username }}!</span>
          </h1>
          <p class="lead">Track your reading progress, discover new books, and connect with fellow readers.</p>
          <hr class="my-4">
          <p *ngIf="!(isAuthenticated$ | async)">Get started by creating an account or browsing our book catalog.</p>
          <p *ngIf="isAuthenticated$ | async">Continue managing your personal library or discover new books.</p>
          <div class="d-flex gap-2">
            <ng-container *ngIf="!(isAuthenticated$ | async); else authenticatedButtons">
              <a routerLink="/register" class="btn btn-primary btn-lg">Get Started</a>
              <a routerLink="/books" class="btn btn-outline-secondary btn-lg">Browse Books</a>
            </ng-container>
            <ng-template #authenticatedButtons>
              <a routerLink="/library" class="btn btn-primary btn-lg">My Library</a>
              <a routerLink="/books" class="btn btn-outline-secondary btn-lg">Browse Books</a>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-5">
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Track Your Reading</h5>
            <p class="card-text">Keep track of books you want to read, are currently reading, and have completed.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Discover Books</h5>
            <p class="card-text">Browse our extensive catalog and discover your next favorite book.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Connect with Friends</h5>
            <p class="card-text">Share recommendations and discuss books with your friends.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jumbotron {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    .card {
      transition: transform 0.2s;
    }
    
    .card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class HomeComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }
}