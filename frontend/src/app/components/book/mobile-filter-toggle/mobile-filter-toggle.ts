import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-filter-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-12 d-lg-none mb-3">
      <button 
        class="btn btn-outline-primary w-100"
        type="button"
        [attr.aria-expanded]="showMobileFilters"
        aria-controls="mobileFilters"
        (click)="toggleFilters()">
        <i class="fas fa-filter me-2"></i>
        Search & Filter
        <span *ngIf="activeFiltersCount > 0" class="badge bg-primary ms-2">{{ activeFiltersCount }}</span>
        <i class="fas fa-chevron-down ms-2 filter-chevron" [class.rotated]="showMobileFilters"></i>
      </button>
    </div>
  `,
  styles: [`
    /* Filter toggle button styling */
    .btn[data-bs-toggle="collapse"] {
      position: relative;
    }

    .btn[data-bs-toggle="collapse"]:not(.collapsed)::after {
      transform: rotate(180deg);
    }

    /* Badge styling for active filters */
    .badge {
      font-size: 0.7rem;
    }

    /* Filter chevron animation */
    .filter-chevron {
      transition: transform 0.3s ease;
    }

    .filter-chevron.rotated {
      transform: rotate(180deg);
    }
  `]
})
export class MobileFilterToggleComponent {
  @Input() showMobileFilters = false;
  @Input() activeFiltersCount = 0;
  @Output() toggleMobileFilters = new EventEmitter<void>();

  toggleFilters(): void {
    this.toggleMobileFilters.emit();
  }
}
