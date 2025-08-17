import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibraryService } from '../../../services/library.service';
import { UserBook } from '../../../models/library.model';

@Component({
    selector: 'app-review-form',
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    template: `
    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" (click)="closeModal()"></div>
    
    <!-- Modal -->
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-star me-2"></i>Review Book
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          
          <div class="modal-body">
            <!-- Book Info -->
            <div class="row mb-4">
              <div class="col-md-3">
                <img 
                  [src]="userBook.book.thumbnail || '/assets/images/book-placeholder.svg'" 
                  [alt]="userBook.book.title"
                  class="img-fluid rounded">
              </div>
              <div class="col-md-9">
                <h6 class="mb-1">{{ userBook.book.title }}</h6>
                <p class="text-muted mb-2">by {{ userBook.book.author }}</p>
                <p *ngIf="userBook.book.description" class="small text-muted">
                  {{ userBook.book.description }}
                </p>
              </div>
            </div>

            <!-- Review Form -->
            <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
              <!-- Rating -->
              <div class="mb-3">
                <label class="form-label">Rating</label>
                <div class="rating-input">
                  <div class="star-rating">
                    <i *ngFor="let star of [1,2,3,4,5]; let i = index" 
                       class="fas fa-star star-input"
                       [class.active]="star <= selectedRating"
                       [class.hover]="star <= hoverRating"
                       (click)="setRating(star)"
                       (mouseenter)="hoverRating = star"
                       (mouseleave)="hoverRating = 0">
                    </i>
                  </div>
                  <span *ngIf="selectedRating > 0" class="ms-2 text-muted">
                    {{ getRatingText(selectedRating) }}
                  </span>
                </div>
                <div *ngIf="reviewForm.get('rating')?.invalid && reviewForm.get('rating')?.touched" 
                     class="text-danger small mt-1">
                  Please select a rating
                </div>
              </div>

              <!-- Review Text -->
              <div class="mb-3">
                <label for="review" class="form-label">Review (Optional)</label>
                <textarea 
                  id="review"
                  class="form-control" 
                  formControlName="review"
                  rows="4" 
                  placeholder="Share your thoughts about this book...">
                </textarea>
                <div class="form-text">
                  {{ reviewForm.get('review')?.value?.length || 0 }}/500 characters
                </div>
              </div>

              <!-- Reading Status -->
              <div class="mb-3">
                <label class="form-label">Reading Status</label>
                <select class="form-select" formControlName="status">
                  <option value="to_read">Want to Read</option>
                  <option value="currently_reading">Currently Reading</option>
                  <option value="read">Read</option>
                </select>
              </div>

              <!-- Favorite Toggle -->
              <div class="mb-3">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="isFavourite"
                    formControlName="isFavourite">
                  <label class="form-check-label" for="isFavourite">
                    <i class="fas fa-heart text-danger me-1"></i>
                    Add to favorites
                  </label>
                </div>
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              (click)="onSubmit()"
              [disabled]="reviewForm.invalid || submitting">
              <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Save Review
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }
    
    .star-rating {
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    .star-input {
      color: #ddd;
      transition: color 0.2s ease;
    }
    
    .star-input.active,
    .star-input.hover {
      color: #ffc107;
    }
    
    .star-input:hover {
      color: #ffc107;
    }
    
    .rating-input {
      display: flex;
      align-items: center;
    }
    
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1040;
      width: 100vw;
      height: 100vh;
      background-color: #000;
      opacity: 0.5;
    }
    
    .modal {
      z-index: 1050;
    }
  `]
})
export class ReviewFormComponent implements OnInit {
  @Input() userBook!: UserBook;
  @Output() reviewSubmitted = new EventEmitter<UserBook>();
  @Output() modalClosed = new EventEmitter<void>();

  reviewForm!: FormGroup;
  selectedRating = 0;
  hoverRating = 0;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private libraryService: LibraryService
  ) {}

  ngOnInit(): void {
    this.selectedRating = this.userBook.rating || 0;
    
    this.reviewForm = this.fb.group({
      rating: [this.userBook.rating || null, Validators.required],
      review: [this.userBook.review || '', [Validators.maxLength(500)]],
      status: [this.userBook.status, Validators.required],
      isFavourite: [this.userBook.isFavourite || false]
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating });
  }

  getRatingText(rating: number): string {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || '';
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.reviewForm.value;
    
    const updateRequest = {
      bookId: this.userBook.book.id,
      status: formValue.status,
      rating: formValue.rating,
      review: formValue.review?.trim() || undefined,
      isFavourite: formValue.isFavourite
    };

    this.libraryService.updateBookStatus(this.userBook.id, updateRequest).subscribe({
      next: (updatedBook) => {
        this.reviewSubmitted.emit(updatedBook);
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error updating book review:', error);
        this.submitting = false;
      }
    });
  }

  closeModal(): void {
    this.modalClosed.emit();
  }
}