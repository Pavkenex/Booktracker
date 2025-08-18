import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserBook } from '../../../../models/library.model';

@Component({
    selector: 'app-book-reviews',
    imports: [CommonModule],
    templateUrl: './book-reviews.html',
    styleUrls: ['./book-reviews.css']
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
