import { Component, input, output } from '@angular/core';

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
  userBook = input.required<UserBook>();
  statusChanged = output<UserBook>();
  
  updating = false;

  constructor(private libraryApi: LibraryApi) {}

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as 'read' | 'currently_reading' | 'to_read';
    const book = this.userBook();
    
    if (newStatus === book.status) {
      return;
    }

    this.updating = true;
    
    const updateRequest = {
      bookId: book.book.id,
      status: newStatus,
      rating: book.rating,
      review: book.review,
      isFavourite: book.isFavourite
    };

    this.libraryApi.updateBookStatus(book.id, updateRequest).subscribe({
      next: (updatedBook) => {
        this.statusChanged.emit(updatedBook);
        this.updating = false;
      },
      error: (error) => {
        console.error('Error updating book status:', error);
        
        target.value = this.userBook().status;
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
