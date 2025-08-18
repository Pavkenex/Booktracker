import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { LibraryApi } from '../../../services/library-api';
import { UserBook } from '../../../models/library.model';

@Component({
    selector: 'app-book-status-selector',
    imports: [FormsModule],
    templateUrl: './book-status-selector.html',
    styleUrls: ['./book-status-selector.css']
})
export class BookStatusSelectorComponent {
  @Input() userBook!: UserBook;
  @Output() statusChanged = new EventEmitter<UserBook>();
  
  updating = false;

  constructor(private libraryApi: LibraryApi) {}

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

    this.libraryApi.updateBookStatus(this.userBook.id, updateRequest).subscribe({
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
