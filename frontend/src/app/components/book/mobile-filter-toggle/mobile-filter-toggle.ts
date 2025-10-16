import { Component, input, output } from '@angular/core';


@Component({
    selector: 'app-mobile-filter-toggle',
    imports: [],
    templateUrl: './mobile-filter-toggle.html',
    styleUrls: ['./mobile-filter-toggle.css']
})
export class MobileFilterToggleComponent {
  showMobileFilters = input<boolean>(false);
  activeFiltersCount = input<number>(0);
  toggleMobileFilters = output<void>();

  toggleFilters(): void {
    this.toggleMobileFilters.emit();
  }
}
