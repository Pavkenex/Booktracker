import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { Book, BookSearchParams, PagedResponse } from '../../../models/book.model';
import { BookFiltersComponent } from '../book-filters/book-filters.component';
import { BookListComponent } from '../book-list/book-list.component';
import { BookPaginationComponent } from '../book-pagination/book-pagination.component';
import { MobileFilterToggleComponent } from '../mobile-filter-toggle/mobile-filter-toggle.component';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [
    CommonModule, 
    BookFiltersComponent, 
    BookListComponent, 
    BookPaginationComponent, 
    MobileFilterToggleComponent
  ],
  template: `
    <div class="container-fluid">
      <div class="row">
        <!-- Mobile Filter Toggle -->
        <app-mobile-filter-toggle
          [showMobileFilters]="showMobileFilters"
          [activeFiltersCount]="getActiveFiltersCount()"
          (toggleMobileFilters)="toggleMobileFilters()">
        </app-mobile-filter-toggle>

        <!-- Search and Filter Sidebar -->
        <div class="col-lg-3 col-md-4 mb-4">
          <app-book-filters
            [searchParams]="searchParams"
            [showMobileFilters]="showMobileFilters"
            (searchParamsChange)="onSearchParamsChange($event)"
            (filtersChanged)="loadBooks()"
            (closeMobileFilters)="closeMobileFilters()">
          </app-book-filters>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9 col-md-8">
          <app-book-list
            [booksResponse]="booksResponse"
            [loading]="loading"
            [error]="error"
            [pageSize]="searchParams.size || 12"
            (pageSizeChange)="onPageSizeChange($event)"
            (retryLoad)="loadBooks()">
          </app-book-list>

          <app-book-pagination
            [pagedResponse]="booksResponse"
            (pageChange)="goToPage($event)">
          </app-book-pagination>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @media (max-width: 767.98px) {
      .container-fluid {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
      }
    }

    @media (max-width: 575.98px) {
      .col-12 {
        padding-left: 0.375rem;
        padding-right: 0.375rem;
      }
    }
  `]
})
export class BookCatalogComponent implements OnInit, OnDestroy {
  booksResponse: PagedResponse<Book> | null = null;
  loading = false;
  error: string | null = null;
  showMobileFilters = false;
  
  searchParams: BookSearchParams = {
    page: 0,
    size: 12,
    title: '',
    author: '',
    genreId: ''
  };

  private destroy$ = new Subject<void>();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Ensure genreId is properly initialized
    this.searchParams.genreId = '';
    this.loadBooks();
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

  onSearchParamsChange(params: BookSearchParams): void {
    this.searchParams = params;
  }

  onPageSizeChange(newSize: number): void {
    this.searchParams.size = newSize;
    this.searchParams.page = 0;
    this.loadBooks();
  }

  goToPage(page: number): void {
    if (page >= 0 && this.booksResponse && page < this.booksResponse.totalPages) {
      this.searchParams.page = page;
      this.loadBooks();
    }
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  closeMobileFilters(): void {
    this.showMobileFilters = false;
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchParams.title?.trim()) count++;
    if (this.searchParams.author?.trim()) count++;
    if (this.searchParams.genreId && this.searchParams.genreId !== '') count++;
    return count;
  }
}