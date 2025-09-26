import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

export type LibraryTab = 'all' | 'to_read' | 'currently_reading' | 'read' | 'favorites';

export interface LibraryTabCounts {
  all: number;
  to_read: number;
  currently_reading: number;
  read: number;
  favorites: number;
}

@Component({
    selector: 'app-library-tab-bar',
    imports: [CommonModule],
    templateUrl: './library-tab-bar.html',
    styleUrls: ['./library-tab-bar.css']
})
export class LibraryTabBarComponent {
  @Input({ required: true }) activeTab!: LibraryTab;
  @Input({ required: true }) counts!: LibraryTabCounts;
  @Output() tabChange = new EventEmitter<LibraryTab>();

  onSelect(tab: LibraryTab): void {
    if (tab !== this.activeTab) {
      this.tabChange.emit(tab);
    }
  }

  onMobileChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.tabChange.emit(target.value as LibraryTab);
  }
}
