import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibraryService } from '../../../services/library.service';
import { LibraryEventsService } from '../../../services/library-events.service';
import { UserBook } from '../../../models/library.model';
import { BookStatusSelectorComponent } from '../book-status-selector/book-status-selector.component';
import { ReviewFormComponent } from '../review-form/review-form.component';
import { LibraryStatsComponent } from '../library-stats/library-stats.component';

@Component({
  selector: 'app-personal-library',
  standalone: true,
  imports: [CommonModule, RouterModule, BookStatusSelectorComponent, ReviewFormComponent, LibraryStatsComponent],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <h2 class="mb-4">
            <i class="fas fa-book-open me-2"></i>My Personal Library
          </h2>
        </div>
      </div>

      <!-- Library Statistics -->
      <div class="row mb-4">
        <div class="col-12">
          <app-library-stats></app-library-stats>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="row mb-4">
        <div class="col-12">
          <!-- Mobile dropdown for tabs -->
          <div class="d-md-none mb-3">
            <select 
              class="form-select" 
              [value]="activeTab" 
              (change)="setActiveTab($any($event.target).value)">
              <option value="all">All Books ({{ allBooks.length }})</option>
              <option value="to_read">Want to Read ({{ booksToRead.length }})</option>
              <option value="currently_reading">Currently Reading ({{ booksCurrentlyReading.length }})</option>
              <option value="read">Read ({{ booksRead.length }})</option>
              <option value="favorites">Favorites ({{ favoriteBooks.length }})</option>
            </select>
          </div>
          
          <!-- Desktop tabs -->
          <ul class="nav nav-tabs d-none d-md-flex" id="libraryTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'all'"
                (click)="setActiveTab('all')"
                type="button">
                <span class="d-none d-lg-inline">All Books</span>
                <span class="d-inline d-lg-none">All</span>
                ({{ allBooks.length }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'to_read'"
                (click)="setActiveTab('to_read')"
                type="button">
                <span class="d-none d-lg-inline">Want to Read</span>
                <span class="d-inline d-lg-none">To Read</span>
                ({{ booksToRead.length }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'currently_reading'"
                (click)="setActiveTab('currently_reading')"
                type="button">
                <span class="d-none d-lg-inline">Currently Reading</span>
                <span class="d-inline d-lg-none">Reading</span>
                ({{ booksCurrentlyReading.length }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'read'"
                (click)="setActiveTab('read')"
                type="button">
                Read ({{ booksRead.length }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'favorites'"
                (click)="setActiveTab('favorites')"
                type="button">
                <i class="fas fa-heart me-1 d-md-none"></i>
                <span class="d-none d-md-inline">Favorites</span>
                <span class="d-inline d-md-none">Fav</span>
                ({{ favoriteBooks.length }})
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Books Display -->
      <div class="row">
        <div class="col-12">
          <div class="tab-content" id="libraryTabContent">
            <!-- Loading State -->
            <div *ngIf="loading" class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loading && filteredBooks.length === 0" class="text-center py-5">
              <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
              <h4 class="text-muted">No books found</h4>
              <p class="text-muted">
                <span *ngIf="activeTab === 'all'">Your library is empty. Start by adding some books!</span>
                <span *ngIf="activeTab === 'to_read'">No books in your "Want to Read" list.</span>
                <span *ngIf="activeTab === 'currently_reading'">No books currently being read.</span>
                <span *ngIf="activeTab === 'read'">No books marked as read yet.</span>
                <span *ngIf="activeTab === 'favorites'">No favorite books selected.</span>
              </p>
              <a routerLink="/books" class="btn btn-primary">
                <i class="fas fa-search me-2"></i>Browse Books
              </a>
            </div>

            <!-- Books Grid -->
            <div *ngIf="!loading && filteredBooks.length > 0" class="row g-3">
              <div *ngFor="let userBook of filteredBooks" class="col-lg-4 col-md-6 col-12">
                <div class="card h-100">
                  <!-- Book Image -->
                  <div class="position-relative book-image-container">
                    <img 
                      [src]="userBook.book.thumbnail || '/assets/images/book-placeholder.svg'" 
                      [alt]="userBook.book.title"
                      class="card-img-top">
                    
                    <!-- Favorite Badge -->
                    <button 
                      *ngIf="userBook.isFavourite"
                      class="btn btn-sm position-absolute top-0 end-0 m-2 favorite-btn"
                      (click)="toggleFavorite(userBook)"
                      title="Remove from favorites">
                      <i class="fas fa-heart text-danger"></i>
                    </button>
                    <button 
                      *ngIf="!userBook.isFavourite"
                      class="btn btn-sm position-absolute top-0 end-0 m-2 favorite-btn"
                      (click)="toggleFavorite(userBook)"
                      title="Add to favorites">
                      <i class="far fa-heart text-muted"></i>
                    </button>
                  </div>

                  <div class="card-body d-flex flex-column">
                    <!-- Book Info -->
                    <h6 class="card-title">{{ userBook.book.title }}</h6>
                    <p class="card-text text-muted small mb-2">by {{ userBook.book.author }}</p>
                    
                    <!-- Status and Rating -->
                    <div class="mb-3">
                      <app-book-status-selector 
                        [userBook]="userBook"
                        (statusChanged)="onStatusChanged($event)">
                      </app-book-status-selector>
                      
                      <!-- Rating Display -->
                      <div *ngIf="userBook.rating" class="mt-2">
                        <small class="text-muted">My Rating:</small>
                        <div class="d-inline-block ms-1">
                          <i *ngFor="let star of [1,2,3,4,5]" 
                             class="fas fa-star star-rating"
                             [class.text-warning]="star <= userBook.rating!"
                             [class.text-muted]="star > userBook.rating!">
                          </i>
                        </div>
                      </div>
                    </div>

                    <!-- Review Preview -->
                    <div *ngIf="userBook.review" class="mb-3 review-preview">
                      <small class="text-muted">My Review:</small>
                      <p class="small mt-1" [title]="userBook.review">
                        {{ userBook.review.length > 80 ? (userBook.review | slice:0:80) + '...' : userBook.review }}
                      </p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-auto">
                      <!-- Mobile: Stacked buttons -->
                      <div class="d-md-none">
                        <div class="d-grid gap-2">
                          <a [routerLink]="['/books', userBook.book.id]" 
                             class="btn btn-outline-primary btn-sm">
                            <i class="fas fa-eye me-2"></i>View Details
                          </a>
                          <div class="btn-group" role="group">
                            <button 
                              class="btn btn-outline-secondary btn-sm"
                              (click)="openReviewForm(userBook)">
                              <i class="fas fa-edit me-1"></i>Review
                            </button>
                            <button 
                              class="btn btn-outline-danger btn-sm"
                              (click)="removeBook(userBook)">
                              <i class="fas fa-trash me-1"></i>Remove
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Desktop: Button group -->
                      <div class="btn-group w-100 d-none d-md-flex" role="group">
                        <a [routerLink]="['/books', userBook.book.id]" 
                           class="btn btn-outline-primary btn-sm">
                          <i class="fas fa-eye me-1"></i>View
                        </a>
                        <button 
                          class="btn btn-outline-secondary btn-sm"
                          (click)="openReviewForm(userBook)">
                          <i class="fas fa-edit me-1"></i>Review
                        </button>
                        <button 
                          class="btn btn-outline-danger btn-sm"
                          (click)="removeBook(userBook)">
                          <i class="fas fa-trash me-1"></i>Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Form Modal -->
    <app-review-form 
      *ngIf="selectedBookForReview"
      [userBook]="selectedBookForReview"
      (reviewSubmitted)="onReviewSubmitted($event)"
      (modalClosed)="closeReviewForm()">
    </app-review-form>
  `,
  styles: [`
    .nav-tabs .nav-link {
      color: #6c757d;
      border: 1px solid transparent;
      font-size: 0.9rem;
    }
    
    .nav-tabs .nav-link.active {
      color: #495057;
      background-color: #fff;
      border-color: #dee2e6 #dee2e6 #fff;
    }
    
    .card {
      transition: transform 0.2s ease-in-out;
    }
    
    /* Only apply hover effects on non-touch devices */
    @media (hover: hover) and (pointer: fine) {
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
    }
    
    .btn-group .btn {
      flex: 1;
    }
    
    .book-image-container {
      height: 200px;
      overflow: hidden;
      background-color: #f8f9fa;
    }
    
    .card-img-top {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .favorite-btn {
      background: rgba(255,255,255,0.9) !important;
      border: none !important;
      min-height: 32px;
      min-width: 32px;
      border-radius: 50%;
    }
    
    .star-rating {
      font-size: 0.875rem;
    }
    
    .review-preview {
      max-height: 60px;
      overflow: hidden;
    }
    
    /* Mobile optimizations */
    @media (max-width: 767.98px) {
      .container {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
      }
      
      .book-image-container {
        height: 180px;
      }
      
      .card-body {
        padding: 0.875rem;
      }
      
      .card-title {
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
      }
      
      .btn-sm {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
        min-height: 40px;
      }
      
      .form-select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      .nav-tabs .nav-link {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
      }
    }
    
    @media (max-width: 575.98px) {
      .book-image-container {
        height: 160px;
      }
      
      .card-body {
        padding: 0.75rem;
      }
      
      .review-preview {
        max-height: 50px;
      }
    }
    
    /* Improve touch targets */
    .btn {
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-sm {
      min-height: 36px;
    }
  `]
})
export class PersonalLibraryComponent implements OnInit {
  allBooks: UserBook[] = [];
  loading = true;
  activeTab: 'all' | 'to_read' | 'currently_reading' | 'read' | 'favorites' = 'all';
  selectedBookForReview: UserBook | null = null;

  constructor(
    private libraryService: LibraryService,
    private libraryEventsService: LibraryEventsService
  ) {}

  ngOnInit(): void {
    this.loadLibrary();
  }

  loadLibrary(): void {
    this.loading = true;
    this.libraryService.getLibrary().subscribe({
      next: (books) => {
        this.allBooks = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading library:', error);
        this.loading = false;
      }
    });
  }

  get filteredBooks(): UserBook[] {
    switch (this.activeTab) {
      case 'to_read':
        return this.booksToRead;
      case 'currently_reading':
        return this.booksCurrentlyReading;
      case 'read':
        return this.booksRead;
      case 'favorites':
        return this.favoriteBooks;
      default:
        return this.allBooks;
    }
  }

  get booksToRead(): UserBook[] {
    return this.allBooks.filter(book => book.status === 'to_read');
  }

  get booksCurrentlyReading(): UserBook[] {
    return this.allBooks.filter(book => book.status === 'currently_reading');
  }

  get booksRead(): UserBook[] {
    return this.allBooks.filter(book => book.status === 'read');
  }

  get favoriteBooks(): UserBook[] {
    return this.allBooks.filter(book => book.isFavourite);
  }

  setActiveTab(tab: 'all' | 'to_read' | 'currently_reading' | 'read' | 'favorites'): void {
    this.activeTab = tab;
  }

  onStatusChanged(updatedBook: UserBook): void {
    const index = this.allBooks.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
      this.allBooks[index] = updatedBook;
      // Notify that library has been updated
      this.libraryEventsService.notifyLibraryUpdated();
    }
  }

  toggleFavorite(userBook: UserBook): void {
    this.libraryService.toggleFavorite(userBook.id).subscribe({
      next: (updatedBook) => {
        const index = this.allBooks.findIndex(book => book.id === updatedBook.id);
        if (index !== -1) {
          this.allBooks[index] = updatedBook;
          // Notify that library has been updated
          this.libraryEventsService.notifyLibraryUpdated();
        }
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
      }
    });
  }

  openReviewForm(userBook: UserBook): void {
    this.selectedBookForReview = userBook;
  }

  closeReviewForm(): void {
    this.selectedBookForReview = null;
  }

  onReviewSubmitted(updatedBook: UserBook): void {
    const index = this.allBooks.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
      this.allBooks[index] = updatedBook;
      // Notify that library has been updated
      this.libraryEventsService.notifyLibraryUpdated();
    }
    this.closeReviewForm();
  }

  removeBook(userBook: UserBook): void {
    if (confirm(`Are you sure you want to remove "${userBook.book.title}" from your library?`)) {
      this.libraryService.removeBookFromLibrary(userBook.id).subscribe({
        next: () => {
          this.allBooks = this.allBooks.filter(book => book.id !== userBook.id);
          // Notify that library has been updated
          this.libraryEventsService.notifyLibraryUpdated();
        },
        error: (error) => {
          console.error('Error removing book:', error);
        }
      });
    }
  }
}