import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LibraryApi } from '../../../services/library-api';
import { UserBook } from '../../../models/library.model';

@Component({
    selector: 'app-review-form',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './review-form.html',
    styleUrls: ['./review-form.css']
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
    private libraryApi: LibraryApi
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

    this.libraryApi.updateBookStatus(this.userBook.id, updateRequest).subscribe({
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
