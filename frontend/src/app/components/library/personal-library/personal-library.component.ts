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
          <ul class="nav nav-tabs" id="libraryTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'all'"
                (click)="setActiveTab('all')"
                type="button">
                All Books ({{ allBooks.length }})
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                [class.active]="activeTab === 'to_read'"
                (click)="setActiveTab('to_read')"
                type="button">
                Want to Read ({{ booksToRead.length }})
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
                Favorites ({{ favoriteBooks.length }})
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
                <span *ngIf="activeTab === 'read'">No books marked as read yet.</span>
                <span *ngIf="activeTab === 'favorites'">No favorite books selected.</span>
              </p>
              <a routerLink="/books" class="btn btn-primary">
                <i class="fas fa-search me-2"></i>Browse Books
              </a>
            </div>

            <!-- Books Grid -->
            <div *ngIf="!loading && filteredBooks.length > 0" class="row">
              <div *ngFor="let userBook of filteredBooks" class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                  <!-- Book Image -->
                  <div class="position-relative">
                    <img 
                      [src]="userBook.book.thumbnail || '/assets/images/book-placeholder.svg'" 
                      [alt]="userBook.book.title"
                      class="card-img-top"
                      style="height: 200px; object-fit: cover;">
                    
                    <!-- Favorite Badge -->
                    <button 
                      *ngIf="userBook.isFavourite"
                      class="btn btn-sm position-absolute top-0 end-0 m-2 p-1"
                      style="background: rgba(255,255,255,0.9); border: none;"
                      (click)="toggleFavorite(userBook)"
                      title="Remove from favorites">
                      <i class="fas fa-heart text-danger"></i>
                    </button>
                    <button 
                      *ngIf="!userBook.isFavourite"
                      class="btn btn-sm position-absolute top-0 end-0 m-2 p-1"
                      style="background: rgba(255,255,255,0.9); border: none;"
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
                             class="fas fa-star"
                             [class.text-warning]="star <= userBook.rating!"
                             [class.text-muted]="star > userBook.rating!">
                          </i>
                        </div>
                      </div>
                    </div>

                    <!-- Review Preview -->
                    <div *ngIf="userBook.review" class="mb-3">
                      <small class="text-muted">My Review:</small>
                      <p class="small mt-1" [title]="userBook.review">
                        {{ userBook.review.length > 100 ? (userBook.review | slice:0:100) + '...' : userBook.review }}
                      </p>
                    </div>

                    <!-- Action Buttons -->
                    <div class="mt-auto">
                      <div class="btn-group w-100" role="group">
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
    }
    
    .nav-tabs .nav-link.active {
      color: #495057;
      background-color: #fff;
      border-color: #dee2e6 #dee2e6 #fff;
    }
    
    .card {
      transition: transform 0.2s ease-in-out;
    }
    
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .btn-group .btn {
      flex: 1;
    }
  `]
})
export class PersonalLibraryComponent implements OnInit {
  allBooks: UserBook[] = [];
  loading = true;
  activeTab: 'all' | 'to_read' | 'read' | 'favorites' = 'all';
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

  get booksRead(): UserBook[] {
    return this.allBooks.filter(book => book.status === 'read');
  }

  get favoriteBooks(): UserBook[] {
    return this.allBooks.filter(book => book.isFavourite);
  }

  setActiveTab(tab: 'all' | 'to_read' | 'read' | 'favorites'): void {
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