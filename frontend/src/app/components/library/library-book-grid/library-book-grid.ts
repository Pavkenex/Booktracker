import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookStatusSelectorComponent } from '../book-status-selector/book-status-selector';
import { UserBook } from '../../../models/library.model';
import { LibraryTab } from '../library-tab-bar/library-tab-bar';

@Component({
    selector: 'app-library-book-grid',
  imports: [CommonModule, NgOptimizedImage, RouterModule, BookStatusSelectorComponent],
    templateUrl: './library-book-grid.html',
    styleUrls: ['./library-book-grid.css']
})
export class LibraryBookGridComponent {
  @Input({ required: true }) books: UserBook[] = [];
  @Input() loading = false;
  @Input({ required: true }) activeTab!: LibraryTab;

  @Output() statusChanged = new EventEmitter<UserBook>();
  @Output() toggleFavorite = new EventEmitter<UserBook>();
  @Output() review = new EventEmitter<UserBook>();
  @Output() remove = new EventEmitter<UserBook>();

  placeholder = '/assets/images/book-placeholder.svg';

  trackByBookId(_: number, userBook: UserBook): number {
    return userBook.id;
  }

  getEmptyStateMessage(): string {
    switch (this.activeTab) {
      case 'to_read':
        return 'No books in your "Want to Read" list.';
      case 'currently_reading':
        return 'No books currently being read.';
      case 'read':
        return 'No books marked as read yet.';
      case 'favorites':
        return 'No favorite books selected.';
      default:
        return 'Your library is empty. Start by adding some books!';
    }
  }
}
