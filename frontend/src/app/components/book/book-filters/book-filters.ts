import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { Genre, BookSearchParams } from '../../../models/book.model';

@Component({
    selector: 'app-book-filters',
    imports: [FormsModule],
    template: `
    <div class="card">
      <div class="card-header d-none d-lg-block">
        <h5 class="mb-0">
          <i class="fas fa-search me-2"></i>Search & Filter
        </h5>
      </div>
      <div class="card-body filter-panel"
        id="mobileFilters"
        [class.mobile-hidden]="!showMobileFilters">
    
        <!-- Mobile Close Button -->
        <div class="d-flex d-lg-none justify-content-between align-items-center mb-3">
          <h6 class="mb-0">
            <i class="fas fa-search me-2"></i>Search & Filter
          </h6>
          <button
            type="button"
            class="btn-close"
            aria-label="Close"
            (click)="onCloseMobileFilters()">
          </button>
        </div>
    
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
                @for (genre of genres; track genre) {
                  <option [value]="genre.id">
                    {{ genre.name }}
                  </option>
                }
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

    /* Mobile filter close button */
    .btn-close {
      background-size: 0.75rem;
    }

    /* Filter panel visibility */
    .filter-panel {
      display: block;
    }
    
    /* Mobile-specific filter panel behavior */
    @media (max-width: 991.98px) {
      .filter-panel.mobile-hidden {
        display: none;
      }
      
      .filter-panel {
        transition: all 0.3s ease;
      }
    }
    
    /* Desktop always shows filter panel */
    @media (min-width: 992px) {
      .filter-panel {
        display: block !important;
      }
    }

    /* Improve form controls on mobile */
    @media (max-width: 767.98px) {
      .form-control, .form-select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
    }
  `]
})
export class BookFiltersComponent implements OnInit, OnDestroy {
  @Input() searchParams!: BookSearchParams;
  @Input() showMobileFilters = false;
  @Output() searchParamsChange = new EventEmitter<BookSearchParams>();
  @Output() filtersChanged = new EventEmitter<void>();
  @Output() closeMobileFilters = new EventEmitter<void>();

  genres: Genre[] = [];
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<void>();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadGenres();
    
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitSearchChange();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.emitSearchChange();
  }

  clearFilters(): void {
    this.searchParams = {
      ...this.searchParams,
      page: 0,
      title: '',
      author: '',
      genreId: ''
    };
    this.searchParamsChange.emit(this.searchParams);
    this.filtersChanged.emit();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchParams.title?.trim() || 
              this.searchParams.author?.trim() || 
              (this.searchParams.genreId && this.searchParams.genreId !== ''));
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchParams.title?.trim()) count++;
    if (this.searchParams.author?.trim()) count++;
    if (this.searchParams.genreId && this.searchParams.genreId !== '') count++;
    return count;
  }

  onCloseMobileFilters(): void {
    this.closeMobileFilters.emit();
  }

  private emitSearchChange(): void {
    this.searchParams.page = 0; // Reset to first page on search
    this.searchParamsChange.emit(this.searchParams);
    this.filtersChanged.emit();
  }
}
