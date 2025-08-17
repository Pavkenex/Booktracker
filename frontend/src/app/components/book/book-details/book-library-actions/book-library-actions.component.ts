import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookStatusSelectorComponent } from '../../../library/book-status-selector/book-status-selector.component';
import { Book } from '../../../../models/book.model';
import { UserBook } from '../../../../models/library.model';

@Component({
  selector: 'app-book-library-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, BookStatusSelectorComponent],
  template: `
    <div class="book-actions mt-4">
      <!-- User not authenticated -->
      <div *ngIf="!isAuthenticated" class="text-center">
        <p class="text-muted mb-3">Sign in to add this book to your library</p>
        <div class="btn-group" role="group">
          <a routerLink="/login" class="btn btn-success">
            <i class="fas fa-sign-in-alt me-2"></i>Sign In
          </a>
          <a routerLink="/register" class="btn btn-outline-primary">
            <i class="fas fa-user-plus me-2"></i>Sign Up
          </a>
          <button class="btn btn-outline-info" (click)="onRecommend()">
            <i class="fas fa-share me-2"></i>Recommend
          </button>
        </div>
      </div>

      <!-- User authenticated but book not in library -->
      <div *ngIf="isAuthenticated && !userBook">
        <!-- Desktop / larger screens: split button group -->
        <div class="btn-group dropdown d-none d-sm-inline-flex" role="group">
          <button
            class="btn btn-success"
            (click)="onAddToLibrary('to_read')"
            [disabled]="addingToLibrary"
          >
            <span *ngIf="addingToLibrary" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!addingToLibrary" class="fas fa-plus me-2"></i>
            Want to Read
          </button>
          <button
            class="btn btn-success dropdown-toggle dropdown-toggle-split"
            type="button"
            (click)="toggleDropdown()"
            [attr.aria-expanded]="dropdownOpen"
            [disabled]="addingToLibrary"
          >
            <span class="visually-hidden">Toggle Dropdown</span>
          </button>
          <ul class="dropdown-menu" [class.show]="dropdownOpen">
            <li>
              <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('to_read')">
                <i class="fas fa-plus me-2 text-success"></i>Want to Read
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('currently_reading')">
                <i class="fas fa-book-open me-2 text-warning"></i>Currently Reading
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('read')">
                <i class="fas fa-check me-2 text-primary"></i>Mark as Read
              </a>
            </li>
          </ul>
          <button class="btn btn-outline-info" (click)="onRecommend()">
            <i class="fas fa-share me-2"></i>Recommend
          </button>
        </div>

        <!-- Mobile: single full-width dropdown button -->
        <div class="dropdown d-sm-none">
          <button
            class="btn btn-success w-100"
            type="button"
            (click)="toggleDropdown()"
            [attr.aria-expanded]="dropdownOpen"
            [disabled]="addingToLibrary"
          >
            <span *ngIf="addingToLibrary" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!addingToLibrary" class="fas fa-plus me-2"></i>
            Add to Library
            <i class="fas fa-caret-down ms-2"></i>
          </button>
          <ul class="dropdown-menu w-100 mobile-dropdown" [class.show]="dropdownOpen">
            <li>
              <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('to_read')">
                <i class="fas fa-plus me-2 text-success"></i>Want to Read
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('currently_reading')">
                <i class="fas fa-book-open me-2 text-warning"></i>Currently Reading
              </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('read')">
                <i class="fas fa-check me-2 text-primary"></i>Mark as Read
              </a>
            </li>
          </ul>
          <button class="btn btn-outline-info w-100 mt-2" (click)="onRecommend()">
            <i class="fas fa-share me-2"></i>Recommend
          </button>
        </div>
      </div>

      <!-- User authenticated and book already in library -->
      <div *ngIf="isAuthenticated && userBook" class="library-status-section">
        <div class="alert alert-info d-flex align-items-center mb-3">
          <i class="fas fa-book me-2"></i>
          <span>This book is in your library</span>
          <button
            class="btn btn-sm btn-outline-danger ms-auto"
            (click)="onRemoveFromLibrary()"
            [disabled]="removingFromLibrary"
          >
            <span *ngIf="removingFromLibrary" class="spinner-border spinner-border-sm me-1"></span>
            <i *ngIf="!removingFromLibrary" class="fas fa-trash me-1"></i>
            Remove
          </button>
        </div>

        <div class="row">
          <div class="col-md-6">
            <app-book-status-selector
              [userBook]="userBook"
              (statusChanged)="onStatusChanged($event)"
            ></app-book-status-selector>
          </div>
          <div class="col-md-6 favorite-toggle">
            <button
              class="btn btn-outline-warning"
              (click)="onToggleFavorite()"
              [disabled]="togglingFavorite"
            >
              <span *ngIf="togglingFavorite" class="spinner-border spinner-border-sm me-1"></span>
              <i *ngIf="!togglingFavorite" 
                 [class]="userBook.isFavourite ? 'fas fa-heart' : 'far fa-heart'" 
                 class="me-1"></i>
              {{ userBook.isFavourite ? 'Remove from Favorites' : 'Add to Favorites' }}
            </button>
          </div>
        </div>

        <div class="row mt-3">
          <div class="col-12">
            <button class="btn btn-outline-info" (click)="onRecommend()">
              <i class="fas fa-share me-2"></i>Recommend
            </button>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="libraryMessage" class="alert alert-success mt-3">
        {{ libraryMessage }}
      </div>
      <div *ngIf="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .book-actions {
      border-top: 1px solid #dee2e6;
      padding-top: 1rem;
    }

    .library-status-section {
      width: 100%;
    }

    .favorite-toggle {
      text-align: right;
    }

    .dropdown-toggle-split {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }

    .dropdown-menu {
      min-width: 180px;
    }

    .dropdown-item {
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
    }

    .dropdown-item:hover {
      background-color: #f8f9fa;
    }

    .dropdown-item i {
      width: 20px;
    }

    @media (max-width: 575.98px) {
      .btn-group .btn {
        margin-bottom: 0.5rem;
        border-radius: 0.375rem !important;
      }
    }
  `]
})
export class BookLibraryActionsComponent {
  @Input() book: Book | null = null;
  @Input() userBook: UserBook | null = null;
  @Input() isAuthenticated = false;
  @Input() addingToLibrary = false;
  @Input() removingFromLibrary = false;
  @Input() togglingFavorite = false;
  @Input() libraryMessage: string | null = null;
  @Input() error: string | null = null;

  @Output() addToLibrary = new EventEmitter<'read' | 'currently_reading' | 'to_read'>();
  @Output() removeFromLibrary = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<UserBook>();
  @Output() recommend = new EventEmitter<void>();

  dropdownOpen = false;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(status: 'read' | 'currently_reading' | 'to_read'): void {
    this.dropdownOpen = false;
    this.onAddToLibrary(status);
  }

  onAddToLibrary(status: 'read' | 'currently_reading' | 'to_read'): void {
    this.addToLibrary.emit(status);
  }

  onRemoveFromLibrary(): void {
    this.removeFromLibrary.emit();
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit();
  }

  onStatusChanged(userBook: UserBook): void {
    this.statusChanged.emit(userBook);
  }

  onRecommend(): void {
    this.recommend.emit();
  }
}
