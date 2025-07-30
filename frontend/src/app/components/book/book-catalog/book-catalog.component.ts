import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { Book, Genre, BookSearchParams, PagedResponse } from '../../../models/book.model';
import { BookCardComponent } from '../book-card/book-card.component';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BookCardComponent],
  template: `
    <div class="container-fluid mt-4">
      <div class="row">
        <!-- Search and Filter Sidebar -->
        <div class="col-lg-3 col-md-4 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-search me-2"></i>Search & Filter
              </h5>
            </div>
            <div class="card-body">
              <!-- Search by Title -->
              <div class="mb-3">
                <label for="titleSearch" class="form-label">Search by Title</label>
                <input
                  type="text"
                  id="titleSearch"
                  class="form-control"
                  [(ngModel)]="searchParams.title"
                  (input)="onSearchChange()"
                  placeholder="Enter book title..."
                />
              </div>

              <!-- Search by Author -->
              <div class="mb-3">
                <label for="authorSearch" class="form-label">Search by Author</label>
                <input
                  type="text"
                  id="authorSearch"
                  class="form-control"
                  [(ngModel)]="searchParams.author"
                  (input)="onSearchChange()"
                  placeholder="Enter author name..."
                />
              </div>

              <!-- Genre Filter -->
              <div class="mb-3">
                <label for="genreFilter" class="form-label">Filter by Genre</label>
                <select
                  id="genreFilter"
                  class="form-select"
                  [(ngModel)]="searchParams.genreId"
                  (change)="onFilterChange()"
                >
                  <option value="">All Genres</option>
                  <option *ngFor="let genre of genres" [value]="genre.id">
                    {{ genre.name }}
                  </option>
                </select>
              </div>

              <!-- Clear Filters -->
              <button
                class="btn btn-outline-secondary w-100"
                (click)="clearFilters()"
                [disabled]="!hasActiveFilters()"
              >
                <i class="fas fa-times me-2"></i>Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9 col-md-8">
          <!-- Header with Results Count -->
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>Book Catalog</h2>
              <p class="text-muted mb-0" *ngIf="booksResponse">
                Showing {{ getResultsText() }}
              </p>
            </div>
            <div class="d-flex align-items-center">
              <label for="pageSize" class="form-label me-2 mb-0">Show:</label>
              <select
                id="pageSize"
                class="form-select form-select-sm"
                style="width: auto;"
                [(ngModel)]="searchParams.size"
                (change)="onPageSizeChange()"
              >
                <option [value]="12">12</option>
                <option [value]="24">24</option>
                <option [value]="48">48</option>
              </select>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading" class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="error" class="alert alert-danger">
            <h5>Error Loading Books</h5>
            <p>{{ error }}</p>
            <button class="btn btn-outline-danger" (click)="loadBooks()">
              Try Again
            </button>
          </div>

          <!-- No Results -->
          <div *ngIf="!loading && !error && booksResponse && booksResponse.content.length === 0" class="text-center py-5">
            <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
            <h4>No Books Found</h4>
            <p class="text-muted">Try adjusting your search criteria or clear the filters.</p>
          </div>

          <!-- Books Grid -->
          <div *ngIf="!loading && !error && booksResponse && booksResponse.content.length > 0">
            <div class="row">
              <div 
                *ngFor="let book of booksResponse.content" 
                class="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4"
              >
                <app-book-card [book]="book"></app-book-card>
              </div>
            </div>

            <!-- Pagination -->
            <nav aria-label="Book catalog pagination" *ngIf="booksResponse.totalPages > 1">
              <ul class="pagination justify-content-center">
                <li class="page-item" [class.disabled]="booksResponse.first">
                  <button 
                    class="page-link" 
                    (click)="goToPage(0)"
                    [disabled]="booksResponse.first"
                  >
                    First
                  </button>
                </li>
                <li class="page-item" [class.disabled]="booksResponse.first">
                  <button 
                    class="page-link" 
                    (click)="goToPage(booksResponse.page - 1)"
                    [disabled]="booksResponse.first"
                  >
                    Previous
                  </button>
                </li>
                
                <li 
                  *ngFor="let page of getVisiblePages()" 
                  class="page-item"
                  [class.active]="page === booksResponse.page"
                >
                  <button 
                    class="page-link" 
                    (click)="goToPage(page)"
                  >
                    {{ page + 1 }}
                  </button>
                </li>
                
                <li class="page-item" [class.disabled]="booksResponse.last">
                  <button 
                    class="page-link" 
                    (click)="goToPage(booksResponse.page + 1)"
                    [disabled]="booksResponse.last"
                  >
                    Next
                  </button>
                </li>
                <li class="page-item" [class.disabled]="booksResponse.last">
                  <button 
                    class="page-link" 
                    (click)="goToPage(booksResponse.totalPages - 1)"
                    [disabled]="booksResponse.last"
                  >
                    Last
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }

    .form-label {
      font-weight: 600;
      color: #495057;
    }

    .pagination .page-link {
      color: #007bff;
    }

    .pagination .page-item.active .page-link {
      background-color: #007bff;
      border-color: #007bff;
    }

    .pagination .page-item.disabled .page-link {
      color: #6c757d;
    }

    @media (max-width: 768px) {
      .container-fluid {
        padding-left: 15px;
        padding-right: 15px;
      }
      
      .pagination {
        flex-wrap: wrap;
      }
      
      .pagination .page-item {
        margin: 2px;
      }
    }

    @media (max-width: 576px) {
      .col-sm-6 {
        flex: 0 0 100%;
        max-width: 100%;
      }
    }
  `]
})
export class BookCatalogComponent implements OnInit, OnDestroy {
  booksResponse: PagedResponse<Book> | null = null;
  genres: Genre[] = [];
  loading = false;
  error: string | null = null;
  
  searchParams: BookSearchParams = {
    page: 0,
    size: 12,
    title: '',
    author: '',
    genreId: ''
  };

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<void>();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Ensure genreId is properly initialized
    this.searchParams.genreId = '';
    
    this.loadGenres();
    this.loadBooks();
    
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.searchParams.page = 0; // Reset to first page on search
        this.loadBooks();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBooks(): void {
    this.loading = true;
    this.error = null;

    this.bookService.getBooks(this.searchParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.booksResponse = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading books:', error);
          this.error = 'Failed to load books. Please try again.';
          this.loading = false;
        }
      });
  }

  loadGenres(): void {
    this.bookService.getGenres()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (genres) => {
          this.genres = genres;
        },
        error: (error) => {
          console.error('Error loading genres:', error);
        }
      });
  }

  onSearchChange(): void {
    this.searchSubject.next();
  }

  onFilterChange(): void {
    this.searchParams.page = 0;
    this.loadBooks();
  }

  onPageSizeChange(): void {
    this.searchParams.page = 0;
    this.loadBooks();
  }

  goToPage(page: number): void {
    if (page >= 0 && this.booksResponse && page < this.booksResponse.totalPages) {
      this.searchParams.page = page;
      this.loadBooks();
    }
  }

  clearFilters(): void {
    this.searchParams = {
      page: 0,
      size: this.searchParams.size,
      title: '',
      author: '',
      genreId: ''
    };
    this.loadBooks();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchParams.title?.trim() || 
              this.searchParams.author?.trim() || 
              (this.searchParams.genreId && this.searchParams.genreId !== ''));
  }

  getResultsText(): string {
    if (!this.booksResponse) return '';
    
    const start = this.booksResponse.page * this.booksResponse.size + 1;
    const end = Math.min(start + this.booksResponse.size - 1, this.booksResponse.totalElements);
    
    return `${start}-${end} of ${this.booksResponse.totalElements} books`;
  }

  getVisiblePages(): number[] {
    if (!this.booksResponse) return [];
    
    const current = this.booksResponse.page;
    const total = this.booksResponse.totalPages;
    const delta = 2; // Number of pages to show on each side of current page
    
    let start = Math.max(0, current - delta);
    let end = Math.min(total - 1, current + delta);
    
    // Adjust if we're near the beginning or end
    if (end - start < 2 * delta) {
      if (start === 0) {
        end = Math.min(total - 1, start + 2 * delta);
      } else if (end === total - 1) {
        start = Math.max(0, end - 2 * delta);
      }
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}