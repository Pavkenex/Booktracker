import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagedResponse } from '../../../models/book.model';

@Component({
    selector: 'app-book-pagination',
    imports: [CommonModule],
    template: `
    <nav aria-label="Book catalog pagination" *ngIf="pagedResponse && pagedResponse.totalPages > 1" class="mt-4">
      <!-- Mobile pagination (simplified) -->
      <div class="d-flex d-md-none justify-content-between align-items-center">
        <button 
          class="btn btn-outline-primary btn-sm"
          (click)="goToPage(pagedResponse.page - 1)"
          [disabled]="pagedResponse.first">
          <i class="fas fa-chevron-left"></i> Previous
        </button>
        
        <span class="small text-muted">
          Page {{ pagedResponse.page + 1 }} of {{ pagedResponse.totalPages }}
        </span>
        
        <button 
          class="btn btn-outline-primary btn-sm"
          (click)="goToPage(pagedResponse.page + 1)"
          [disabled]="pagedResponse.last">
          Next <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <!-- Desktop pagination (full) -->
      <ul class="pagination justify-content-center d-none d-md-flex">
        <li class="page-item" [class.disabled]="pagedResponse.first">
          <button 
            class="page-link" 
            (click)="goToPage(0)"
            [disabled]="pagedResponse.first"
          >
            First
          </button>
        </li>
        <li class="page-item" [class.disabled]="pagedResponse.first">
          <button 
            class="page-link" 
            (click)="goToPage(pagedResponse.page - 1)"
            [disabled]="pagedResponse.first"
          >
            Previous
          </button>
        </li>
        
        <li 
          *ngFor="let page of getVisiblePages()" 
          class="page-item"
          [class.active]="page === pagedResponse.page"
        >
          <button 
            class="page-link" 
            (click)="goToPage(page)"
          >
            {{ page + 1 }}
          </button>
        </li>
        
        <li class="page-item" [class.disabled]="pagedResponse.last">
          <button 
            class="page-link" 
            (click)="goToPage(pagedResponse.page + 1)"
            [disabled]="pagedResponse.last"
          >
            Next
          </button>
        </li>
        <li class="page-item" [class.disabled]="pagedResponse.last">
          <button 
            class="page-link" 
            (click)="goToPage(pagedResponse.totalPages - 1)"
            [disabled]="pagedResponse.last"
          >
            Last
          </button>
        </li>
      </ul>
    </nav>
  `,
    styles: [`
    .pagination .page-link {
      color: #007bff;
    }

    .pagination .page-item.active .page-link {
      background-color: #007bff;
      border-color: #007bff;
    }

    .pagination .page-item.disabled .page-link {
      color: #6c757d;
    }

    /* Touch-friendly pagination buttons */
    .btn-sm {
      min-height: 36px;
      padding: 0.375rem 0.75rem;
    }
  `]
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
