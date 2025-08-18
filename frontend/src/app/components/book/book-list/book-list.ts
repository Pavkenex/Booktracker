import { Component, Input, Output, EventEmitter } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Book, PagedResponse } from '../../../models/book.model';
import { BookCardComponent } from '../book-card/book-card';

@Component({
    selector: 'app-book-list',
    imports: [FormsModule, BookCardComponent],
    templateUrl: './book-list.html',
    styleUrls: ['./book-list.css']
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
