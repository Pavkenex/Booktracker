import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBook } from '../../../../models/library.model';

@Component({
    selector: 'app-book-reviews',
    imports: [CommonModule],
    template: `
    <div class="reviews-section mt-5">
      <h3 class="mb-3">Recent Reviews</h3>
      
      <div *ngIf="loadingReviews" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      
      <div *ngIf="!loadingReviews && reviews.length === 0" class="text-muted">
        No reviews yet.
      </div>
      
      <div class="list-group">
        <div class="list-group-item" *ngFor="let review of reviews">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <div>
              <span class="badge bg-warning text-dark me-2" *ngIf="review.rating">
                {{ review.rating }}★
              </span>
              <span class="fw-semibold" *ngIf="review.username">
                &#64;{{ review.username }}
              </span>
            </div>
            <small class="text-muted" *ngIf="review.readDate">
              {{ review.readDate | date:'mediumDate' }}
            </small>
          </div>
          <div *ngIf="review.review" class="review-text">{{ review.review }}</div>
          <div class="small text-muted mt-1">
            Status: {{ review.status.replace('_',' ') }}
          </div>
        </div>
      </div>
      
      <div class="mt-3 text-center" *ngIf="hasMoreReviews">
        <button 
          class="btn btn-outline-primary btn-sm" 
          (click)="onLoadMoreReviews()" 
          [disabled]="loadingReviews">
          Show More
        </button>
      </div>
    </div>
  `,
    styles: [`
    .reviews-section {
      border-top: 1px solid #dee2e6;
      padding-top: 2rem;
    }

    .review-text {
      white-space: pre-wrap;
    }

    .list-group-item {
      border: 1px solid #dee2e6;
      margin-bottom: 0.5rem;
      border-radius: 0.375rem;
    }

    .list-group-item:last-child {
      margin-bottom: 0;
    }
  `]
})
export class BookReviewsComponent {
  @Input() reviews: UserBook[] = [];
  @Input() loadingReviews = false;
  @Input() hasMoreReviews = false;

  @Output() loadMoreReviews = new EventEmitter<void>();

  onLoadMoreReviews(): void {
    this.loadMoreReviews.emit();
  }
}
