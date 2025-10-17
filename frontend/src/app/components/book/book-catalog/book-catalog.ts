import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { BookApi } from '../../../services/book-api';
import { Book, BookSearchParams, PagedResponse } from '../../../models/book.model';
import { BookFiltersComponent } from '../book-filters/book-filters';
import { BookListComponent } from '../book-list/book-list';
import { BookPaginationComponent } from '../book-pagination/book-pagination';
import { MobileFilterToggleComponent } from '../mobile-filter-toggle/mobile-filter-toggle';

@Component({
    selector: 'app-book-catalog',
    imports: [
    BookFiltersComponent,
    BookListComponent,
    BookPaginationComponent,
    MobileFilterToggleComponent
],
    templateUrl: './book-catalog.html',
    styleUrls: ['./book-catalog.css']
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

  constructor(private bookApi: BookApi) {}

  ngOnInit(): void {
    
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

    this.bookApi.getBooks(this.searchParams)
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
