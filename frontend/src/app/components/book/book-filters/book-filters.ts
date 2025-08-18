import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { BookApi } from '../../../services/book-api';
import { Genre, BookSearchParams } from '../../../models/book.model';

@Component({
    selector: 'app-book-filters',
    imports: [FormsModule],
    templateUrl: './book-filters.html',
    styleUrls: ['./book-filters.css']
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

  constructor(private bookApi: BookApi) {}

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
    this.bookApi.getGenres()
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
