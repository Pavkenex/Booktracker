import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FallbackImageDirective } from '../../../../directives/fallback-image';
import { Book } from '../../../../models/book.model';

@Component({
    selector: 'app-similar-books',
    imports: [RouterModule, FallbackImageDirective],
    template: `
    @if (similarBooks.length > 0) {
      <div class="similar-section mt-5">
        <h3 class="mb-3">Similar Books</h3>
        <div class="similar-slider-wrapper">
          <div class="similar-slider" #similarSlider>
            @for (book of similarBooks; track trackByBookId($index, book)) {
              <div
                class="similar-item"
                (click)="onNavigateToBook(book.id)">
                <div class="thumb-wrapper">
                  <img
                    [src]="book.thumbnail"
                    [alt]="book.title"
                    appFallbackImage>
                  </div>
                  <div class="mt-2 text-center">
                    <div class="fw-semibold small text-truncate" [title]="book.title">
                      {{ book.title }}
                    </div>
                    <div class="text-muted small text-truncate" [title]="book.author">
                      {{ book.author }}
                    </div>
                  </div>
                </div>
              }
            </div>
            <button
              class="btn btn-outline-secondary slider-btn position-absolute top-50 start-0 translate-middle-y"
              style="left: -20px;"
              (click)="onScrollPrevious()"
              type="button">
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              class="btn btn-outline-secondary slider-btn position-absolute top-50 end-0 translate-middle-y"
              style="right: -20px;"
              (click)="onScrollNext()"
              type="button">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      }
    `,
    styles: [`
    .similar-section {
      border-top: 1px solid #dee2e6;
      padding-top: 2rem;
    }

    .similar-slider-wrapper {
      position: relative;
    }

    .similar-slider {
      display: flex;
      overflow-x: auto;
      scroll-behavior: smooth;
      gap: 1rem;
      padding-bottom: 0.5rem;
    }

    .similar-slider::-webkit-scrollbar {
      height: 8px;
    }

    .similar-slider::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .similar-slider::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }

    .similar-item {
      flex: 0 0 140px;
      max-width: 140px;
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .similar-item:hover {
      transform: translateY(-2px);
    }

    .thumb-wrapper {
      width: 100%;
      aspect-ratio: 2/3;
      overflow: hidden;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }

    .thumb-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (min-width: 576px) {
      .similar-item {
        flex: 0 0 160px;
        max-width: 160px;
      }
    }

    .slider-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
  `]
})
export class SimilarBooksComponent {
  @Input() similarBooks: Book[] = [];
  @Output() navigateToBook = new EventEmitter<number>();

  @ViewChild('similarSlider') similarSlider?: ElementRef<HTMLElement>;

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  onScrollPrevious(): void {
    this.scrollSimilar('prev');
  }

  onScrollNext(): void {
    this.scrollSimilar('next');
  }

  onNavigateToBook(bookId: number): void {
    this.navigateToBook.emit(bookId);
  }

  private scrollSimilar(direction: 'prev' | 'next'): void {
    const el = this.similarSlider?.nativeElement;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ 
      left: direction === 'next' ? amount : -amount, 
      behavior: 'smooth' 
    });
  }
}
