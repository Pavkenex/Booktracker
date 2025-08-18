import { Component, Input, Output, EventEmitter } from '@angular/core';

import { PagedResponse } from '../../../models/book.model';

@Component({
    selector: 'app-book-pagination',
    imports: [],
    templateUrl: './book-pagination.html',
    styleUrls: ['./book-pagination.css']
})
export class BookPaginationComponent {
  @Input() pagedResponse: PagedResponse<any> | null = null;
  @Output() pageChange = new EventEmitter<number>();

  goToPage(page: number): void {
    if (page >= 0 && this.pagedResponse && page < this.pagedResponse.totalPages) {
      this.pageChange.emit(page);
    }
  }

  getVisiblePages(): number[] {
    if (!this.pagedResponse) return [];
    
    const current = this.pagedResponse.page;
    const total = this.pagedResponse.totalPages;
    const delta = 2; // Number of pages to show on each side of current page
    
    let start = Math.max(0, current - delta);
    let end = Math.min(total - 1, current + delta);
    
    // Adjust if we're near the beginning or end
    if (end - start < 2 * delta) {
      if (start === 0) {
        end = Math.min(total - 1, start + 2 * delta);
      } else if (end === total - 1) {
        start = Math.max(0, end - 2 * delta);
      }
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
