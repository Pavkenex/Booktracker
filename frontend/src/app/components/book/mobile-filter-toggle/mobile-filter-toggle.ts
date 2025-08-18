import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
    selector: 'app-mobile-filter-toggle',
    imports: [],
    templateUrl: './mobile-filter-toggle.html',
    styleUrls: ['./mobile-filter-toggle.css']
})
export class MobileFilterToggleComponent {
  @Input() showMobileFilters = false;
  @Input() activeFiltersCount = 0;
  @Output() toggleMobileFilters = new EventEmitter<void>();

  toggleFilters(): void {
    this.toggleMobileFilters.emit();
  }
}
