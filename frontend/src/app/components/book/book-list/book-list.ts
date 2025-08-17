import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Book, PagedResponse } from '../../../models/book.model';
import { BookCardComponent } from '../book-card/book-card';

@Component({
    selector: 'app-book-list',
    imports: [CommonModule, FormsModule, BookCardComponent],
    template: `
    <!-- Header with Results Count -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
      <div class="mb-2 mb-md-0">
        <h2 class="h3 mb-1">Book Catalog</h2>
        <p class="text-muted mb-0 small" *ngIf="booksResponse">
          {{ getResultsText() }}
        </p>
      </div>
      <div class="d-flex align-items-center">
        <label for="pageSize" class="form-label me-2 mb-0 small d-none d-md-inline">Show:</label>
        <select
          id="pageSize"
          class="form-select form-select-sm"
          style="min-width: 80px;"
          [value]="pageSize"
          (change)="onPageSizeChange($event)"
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
      <button class="btn btn-outline-danger" (click)="retry()">
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
      <div class="row g-3">
        <div 
          *ngFor="let book of booksResponse.content" 
          class="col-xl-3 col-lg-4 col-md-6 col-12"
        >
          <app-book-card [book]="book"></app-book-card>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @media (max-width: 767.98px) {
      .h3 {
        font-size: 1.5rem;
      }
      
      /* Improve form controls on mobile */
      .form-control, .form-select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      /* Better spacing for mobile cards */
      .row.g-3 {
        --bs-gutter-x: 0.75rem;
        --bs-gutter-y: 0.75rem;
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
export class BookListComponent {
  @Input() booksResponse: PagedResponse<Book> | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() pageSize = 12;
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() retryLoad = new EventEmitter<void>();

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = parseInt(target.value, 10);
    this.pageSizeChange.emit(newPageSize);
  }

  retry(): void {
    this.retryLoad.emit();
  }

  getResultsText(): string {
    if (!this.booksResponse) return '';
    
    const start = this.booksResponse.page * this.booksResponse.size + 1;
    const end = Math.min(start + this.booksResponse.size - 1, this.booksResponse.totalElements);
    
    return `${start}-${end} of ${this.booksResponse.totalElements} books`;
  }
}
