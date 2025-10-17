import { Component, input, output } from '@angular/core';

import { PagedResponse } from '../../../models/book.model';

@Component({
    selector: 'app-book-pagination',
    imports: [],
    templateUrl: './book-pagination.html',
    styleUrls: ['./book-pagination.css']
})
export class BookPaginationComponent {
  pagedResponse = input<PagedResponse<any> | null>(null);
  pageChange = output<number>();

  goToPage(page: number): void {
    const response = this.pagedResponse();
    if (page >= 0 && response && page < response.totalPages) {
      this.pageChange.emit(page);
    }
  }

  getVisiblePages(): number[] {
    const response = this.pagedResponse();
    if (!response) return [];
    
    const current = response.page;
    const total = response.totalPages;
    const delta = 2; 
    
    let start = Math.max(0, current - delta);
    let end = Math.min(total - 1, current + delta);
    
    
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
