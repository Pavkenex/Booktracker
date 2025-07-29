import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryService } from '../../../services/library.service';
import { LibraryStats } from '../../../models/library.model';

@Component({
  selector: 'app-library-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="card-header">
        <h5 class="card-title mb-0">
          <i class="fas fa-chart-bar me-2"></i>Reading Statistics
        </h5>
      </div>
      <div class="card-body">
        <div *ngIf="loading" class="text-center py-3">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div *ngIf="!loading && stats" class="row text-center">
          <!-- Total Books -->
          <div class="col-6 col-md-3 mb-3">
            <div class="stat-item">
              <div class="stat-number text-primary">{{ stats.totalBooks }}</div>
              <div class="stat-label">Total Books</div>
            </div>
          </div>

          <!-- Books Read -->
          <div class="col-6 col-md-3 mb-3">
            <div class="stat-item">
              <div class="stat-number text-success">{{ stats.booksRead }}</div>
              <div class="stat-label">Books Read</div>
            </div>
          </div>

          <!-- Books to Read -->
          <div class="col-6 col-md-3 mb-3">
            <div class="stat-item">
              <div class="stat-number text-warning">{{ stats.booksToRead }}</div>
              <div class="stat-label">Want to Read</div>
            </div>
          </div>

          <!-- Favorite Books -->
          <div class="col-6 col-md-3 mb-3">
            <div class="stat-item">
              <div class="stat-number text-danger">{{ stats.favoriteBooks }}</div>
              <div class="stat-label">Favorites</div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div *ngIf="!loading && stats && stats.totalBooks > 0" class="mt-3">
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

        <!-- Average Rating -->
        <div *ngIf="!loading && stats && stats.averageRating > 0" class="mt-3 text-center">
          <small class="text-muted d-block">Average Rating</small>
          <div class="mt-1">
            <i *ngFor="let star of [1,2,3,4,5]" 
               class="fas fa-star"
               [class.text-warning]="star <= stats.averageRating"
               [class.text-muted]="star > stats.averageRating">
            </i>
            <span class="ms-2 text-muted">({{ stats.averageRating.toFixed(1) }})</span>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && (!stats || stats.totalBooks === 0)" class="text-center py-3">
          <i class="fas fa-book-open fa-2x text-muted mb-2"></i>
          <p class="text-muted mb-0">No books in your library yet</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stat-item {
      padding: 0.5rem;
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 0.875rem;
      color: #6c757d;
      margin-top: 0.25rem;
    }
    
    .progress {
      border-radius: 4px;
    }
    
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
  `]
})
export class LibraryStatsComponent implements OnInit {
  stats: LibraryStats | null = null;
  loading = true;

  constructor(private libraryService: LibraryService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.libraryService.getLibraryStats().subscribe({
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

  getReadingPercentage(): number {
    if (!this.stats || this.stats.totalBooks === 0) {
      return 0;
    }
    return Math.round((this.stats.booksRead / this.stats.totalBooks) * 100);
  }
}