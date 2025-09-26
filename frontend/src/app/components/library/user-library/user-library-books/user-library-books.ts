import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { UserBook } from '../../../../models/library.model';

@Component({
    selector: 'app-user-library-books',
    imports: [CommonModule, RouterModule],
    templateUrl: './user-library-books.html',
    styleUrls: ['./user-library-books.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLibraryBooksComponent {
  @Input() books: UserBook[] = [];

  readonly placeholder = '/assets/images/book-placeholder.png';

  trackByBook(_: number, userBook: UserBook): number {
    return userBook.id;
  }

  getStatusBadgeClass(status: UserBook['status']): string {
    switch (status) {
      case 'read':
        return 'bg-success';
      case 'currently_reading':
        return 'bg-warning';
      case 'to_read':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: UserBook['status']): string {
    switch (status) {
      case 'read':
        return 'Completed';
      case 'currently_reading':
        return 'Currently Reading';
      case 'to_read':
        return 'Want to Read';
      default:
        return status;
    }
  }

  getFilledStars(rating?: number): number[] {
    if (!rating) {
      return [];
    }
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating?: number): number[] {
    if (!rating) {
      return Array(5).fill(0);
    }
    return Array(5 - Math.floor(rating)).fill(0);
  }
}
