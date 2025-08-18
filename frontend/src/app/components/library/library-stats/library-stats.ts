import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';
import { LibraryApi } from '../../../services/library-api';
import { LibraryEvents } from '../../../services/library-events';
import { LibraryStats } from '../../../models/library.model';

@Component({
    selector: 'app-library-stats',
    imports: [],
    template: `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="fas fa-chart-bar me-2"></i>Reading Statistics
        </h5>
      </div>
      <div class="card-body">
        @if (loading) {
          <div class="text-center py-3">
            <div class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        }
    
        @if (!loading && stats) {
          <div class="stats-grid mb-3">
            <div class="stat-item" aria-label="Total books">
              <div class="stat-icon text-primary"><i class="fas fa-book"></i></div>
              <div class="stat-number text-primary">{{ stats.totalBooks }}</div>
              <div class="stat-label">Total</div>
            </div>
            <div class="stat-item" aria-label="Books read">
              <div class="stat-icon text-success"><i class="fas fa-check"></i></div>
              <div class="stat-number text-success">{{ stats.booksRead }}</div>
              <div class="stat-label">Read</div>
            </div>
            <div class="stat-item" aria-label="Currently reading">
              <div class="stat-icon text-info"><i class="fas fa-book-open"></i></div>
              <div class="stat-number text-info">{{ stats.booksCurrentlyReading }}</div>
              <div class="stat-label">Reading</div>
            </div>
            <div class="stat-item" aria-label="Want to read">
              <div class="stat-icon text-warning"><i class="fas fa-list"></i></div>
              <div class="stat-number text-warning">{{ stats.booksToRead }}</div>
              <div class="stat-label">Want to Read</div>
            </div>
            <div class="stat-item" aria-label="Favorite books">
              <div class="stat-icon text-danger"><i class="fas fa-heart"></i></div>
              <div class="stat-number text-danger">{{ stats.favoriteBooks }}</div>
              <div class="stat-label">Favorites</div>
            </div>
          </div>
        }
    
        <!-- Progress Bar -->
        @if (!loading && stats && stats.totalBooks > 0) {
          <div class="mt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <small class="text-muted">Reading Progress</small>
              <small class="text-muted">{{ getReadingPercentage() }}%</small>
            </div>
            <div class="progress" style="height: 8px;">
              <div
                class="progress-bar bg-success"
                role="progressbar"
                [style.width.%]="getReadingPercentage()"
                [attr.aria-valuenow]="getReadingPercentage()"
                aria-valuemin="0"
                aria-valuemax="100">
              </div>
            </div>
          </div>
        }
    
        <!-- Average Rating -->
        @if (!loading && stats && stats.averageRating > 0) {
          <div class="mt-3 text-center">
            <small class="text-muted d-block">Average Rating</small>
            <div class="mt-1">
              @for (star of [1,2,3,4,5]; track star) {
                <i
                  class="fas fa-star"
                  [class.text-warning]="star <= stats.averageRating"
                  [class.text-muted]="star > stats.averageRating">
                </i>
              }
              <span class="ms-2 text-muted">({{ stats.averageRating.toFixed(1) }})</span>
            </div>
          </div>
        }
    
        <!-- Empty State -->
        @if (!loading && (!stats || stats.totalBooks === 0)) {
          <div class="text-center py-3">
            <i class="fas fa-book-open fa-2x text-muted mb-2"></i>
            <p class="text-muted mb-0">No books in your library yet</p>
          </div>
        }
      </div>
    </div>
    `,
    styles: [`
    .stats-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); 
      gap: 0.75rem; 
    }
    .stat-item { 
      background:#f8f9fa; 
      border:1px solid #e9ecef; 
      border-radius:8px; 
      padding:.75rem .5rem; 
      text-align:center; 
      display:flex; 
      flex-direction:column; 
      align-items:center; 
      justify-content:space-between; 
      min-height:110px;
    }
    .stat-item:hover { background:#f1f3f5; }
    .stat-icon { font-size:1.1rem; margin-bottom:.25rem; }
    .stat-number { font-size:1.75rem; font-weight:600; line-height:1; }
    .stat-label { font-size:.75rem; letter-spacing:.5px; text-transform:uppercase; color:#6c757d; margin-top:.35rem; }
    .progress { border-radius:4px; }
    .card-header { background-color:#f8f9fa; border-bottom:1px solid #dee2e6; }
    @media (min-width: 992px) { .stat-number { font-size:2rem; } }
  `]
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
