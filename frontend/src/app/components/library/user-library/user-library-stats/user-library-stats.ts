import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserLibraryStatsSummary {
  total: number;
  read: number;
  currentlyReading: number;
  toRead: number;
}

@Component({
    selector: 'app-user-library-stats',
    imports: [CommonModule],
    templateUrl: './user-library-stats.html',
    styleUrls: ['./user-library-stats.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLibraryStatsComponent {
  @Input() stats: UserLibraryStatsSummary | null = null;
  @Input() loading = false;
}
