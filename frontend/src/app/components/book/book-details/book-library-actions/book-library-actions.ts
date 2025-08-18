import { Component, Input, Output, EventEmitter } from '@angular/core';

import { RouterModule } from '@angular/router';
import { BookStatusSelectorComponent } from '../../../library/book-status-selector/book-status-selector';
import { Book } from '../../../../models/book.model';
import { UserBook } from '../../../../models/library.model';

@Component({
    selector: 'app-book-library-actions',
    imports: [RouterModule, BookStatusSelectorComponent],
    templateUrl: './book-library-actions.html',
    styleUrls: ['./book-library-actions.css']
})
export class BookLibraryActionsComponent {
  @Input() book: Book | null = null;
  @Input() userBook: UserBook | null = null;
  @Input() isAuthenticated = false;
  @Input() addingToLibrary = false;
  @Input() removingFromLibrary = false;
  @Input() togglingFavorite = false;
  @Input() libraryMessage: string | null = null;
  @Input() error: string | null = null;

  @Output() addToLibrary = new EventEmitter<'read' | 'currently_reading' | 'to_read'>();
  @Output() removeFromLibrary = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<void>();
  @Output() statusChanged = new EventEmitter<UserBook>();
  @Output() recommend = new EventEmitter<void>();

  dropdownOpen = false;

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(status: 'read' | 'currently_reading' | 'to_read'): void {
    this.dropdownOpen = false;
    this.onAddToLibrary(status);
  }

  onAddToLibrary(status: 'read' | 'currently_reading' | 'to_read'): void {
    this.addToLibrary.emit(status);
  }

  onRemoveFromLibrary(): void {
    this.removeFromLibrary.emit();
  }

  onToggleFavorite(): void {
    this.toggleFavorite.emit();
  }

  onStatusChanged(userBook: UserBook): void {
    this.statusChanged.emit(userBook);
  }

  onRecommend(): void {
    this.recommend.emit();
  }
}
