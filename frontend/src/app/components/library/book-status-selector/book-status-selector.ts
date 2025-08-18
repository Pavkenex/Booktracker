import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LibraryService } from '../../../services/library.service';
import { UserBook } from '../../../models/library.model';

@Component({
    selector: 'app-book-status-selector',
    imports: [FormsModule],
    template: `
    <div class="status-selector">
      <label class="form-label small text-muted">Reading Status:</label>
      <select
        class="form-select form-select-sm"
        [value]="userBook.status"
        (change)="onStatusChange($event)"
        [disabled]="updating">
        <option value="to_read">Want to Read</option>
        <option value="currently_reading">Currently Reading</option>
        <option value="read">Read</option>
      </select>
    
      <!-- Loading indicator -->
      @if (updating) {
        <div class="text-center mt-1">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Updating...</span>
          </div>
        </div>
      }
    
      <!-- Read date display -->
      @if (userBook.status === 'read' && userBook.readDate) {
        <div class="mt-1">
          <small class="text-muted">
            <i class="fas fa-calendar-check me-1"></i>
            Read on {{ formatDate(userBook.readDate) }}
          </small>
        </div>
      }
    </div>
    `,
    styles: [`
    .status-selector {
      margin-bottom: 0.5rem;
    }
    
    .form-select-sm {
      font-size: 0.875rem;
    }
    
    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }
  `]
})
export class BookStatusSelectorComponent {
  @Input() userBook!: UserBook;
  @Output() statusChanged = new EventEmitter<UserBook>();
  
  updating = false;

  constructor(private libraryService: LibraryService) {}

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'read' | 'currently_reading' | 'to_read';
    
    if (newStatus === this.userBook.status) {
      return;
    }

    this.updating = true;
    
    const updateRequest = {
      bookId: this.userBook.book.id,
      status: newStatus,
      rating: this.userBook.rating,
      review: this.userBook.review,
      isFavourite: this.userBook.isFavourite
    };

    this.libraryService.updateBookStatus(this.userBook.id, updateRequest).subscribe({
      next: (updatedBook) => {
        this.statusChanged.emit(updatedBook);
        this.updating = false;
      },
      error: (error) => {
        console.error('Error updating book status:', error);
        // Revert the select value on error
        target.value = this.userBook.status;
        this.updating = false;
      }
    });
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}