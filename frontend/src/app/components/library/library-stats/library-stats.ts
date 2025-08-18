import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { LibraryApi } from '../../../services/library-api';
import { LibraryEvents } from '../../../services/library-events';
import { LibraryStats } from '../../../models/library.model';

@Component({
    selector: 'app-library-stats',
    imports: [],
    templateUrl: './library-stats.html',
    styleUrls: ['./library-stats.css']
})
export class LibraryStatsComponent implements OnInit, OnDestroy {
  stats: LibraryStats | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private libraryApi: LibraryApi,
    private libraryEvents: LibraryEvents
  ) {}

  ngOnInit(): void {
    this.loadStats();
    
    // Listen for library update events
    this.libraryEvents.libraryUpdated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadStats();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStats(): void {
    this.loading = true;
    this.libraryApi.getLibraryStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading library stats:', error);
          this.loading = false;
        }
      });
  }

  refreshStats(): void {
    this.loadStats();
  }

  getReadingPercentage(): number {
    if (!this.stats || this.stats.totalBooks === 0) {
      return 0;
    }
    return Math.round((this.stats.booksRead / this.stats.totalBooks) * 100);
  }
}
