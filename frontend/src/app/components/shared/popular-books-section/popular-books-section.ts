import {
  Component,
  OnInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { BookService } from "../../../services/book.service";
import { Book } from "../../../models/book.model";
import { APP_CONSTANTS } from "../../../constants/app.constants";
import { SliderUtil } from "../../../utils/slider.util";
import { FallbackImageDirective } from "../../../directives/fallback-image.directive";

@Component({
    selector: "app-popular-books-section",
    imports: [CommonModule, RouterModule, FallbackImageDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="popular-books-section">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="section-title">Most Popular Books</h3>
        <a routerLink="/books" class="btn btn-outline-primary btn-sm">
          View All Books
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading popular books...</span>
        </div>
        <p class="text-muted mt-2">Loading popular books...</p>
      </div>

      <!-- Error State -->
      <div
        *ngIf="hasError && !isLoading"
        class="alert alert-warning text-center"
      >
        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
        <h5>Unable to load popular books</h5>
        <p class="mb-2">
          There was an issue loading the popular books. Please try again later.
        </p>
        <button
          class="btn btn-outline-primary btn-sm"
          (click)="loadPopularBooks()"
        >
          <i class="fas fa-redo me-1"></i>
          Retry
        </button>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!isLoading && !hasError && popularBooks.length === 0"
        class="text-center py-4"
      >
        <i class="fas fa-book fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">No popular books yet</h5>
        <p class="text-muted">
          Popular books will appear here as users discover and view them.
        </p>
        <a routerLink="/books" class="btn btn-primary"> Browse All Books </a>
      </div>

      <!-- Popular Books Slider -->
      <div
        *ngIf="!isLoading && !hasError && popularBooks.length > 0"
        class="popular-books-slider"
      >
        <div class="slider-container">
          <button
            class="slider-btn slider-btn-prev"
            (click)="previousSlide()"
            (keydown.enter)="previousSlide()"
            (keydown.space)="$event.preventDefault(); previousSlide()"
            [disabled]="currentSlide === 0"
            [attr.aria-label]="
              'Previous books, currently showing slide ' +
              (currentSlide + 1) +
              ' of ' +
              totalSlides
            "
            type="button"
          >
            <i class="fas fa-chevron-left" aria-hidden="true"></i>
          </button>

          <div class="slider-wrapper">
            <div class="slider-track">
              <div
                *ngFor="
                  let book of currentSlideBooks;
                  trackBy: trackByBookId;
                  let i = index
                "
                class="popular-book-card"
                [routerLink]="['/books', book.id]"
              >
                <div class="book-thumbnail">
                  <img
                    [src]="book.thumbnail || defaultPlaceholder"
                    [alt]="book.title"
                    class="book-image"
                    appFallbackImage
                  />
                  <div class="rank-badge">#{{ getRankForBook(i) }}</div>
                </div>

                <div class="book-info">
                  <h6 class="book-title" [title]="book.title">
                    {{ book.title }}
                  </h6>
                  <p class="book-author" [title]="book.author">
                    by {{ book.author }}
                  </p>

                  <!-- Genres if available -->
                  <div
                    class="book-genres"
                    *ngIf="book.genres && book.genres.length > 0"
                  >
                    <span
                      *ngFor="let genre of book.genres.slice(0, 2)"
                      class="genre-badge"
                    >
                      {{ genre.name }}
                    </span>
                    <span *ngIf="book.genres.length > 2" class="more-genres">
                      +{{ book.genres.length - 2 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            class="slider-btn slider-btn-next"
            (click)="nextSlide()"
            (keydown.enter)="nextSlide()"
            (keydown.space)="$event.preventDefault(); nextSlide()"
            [disabled]="currentSlide >= maxSlide"
            [attr.aria-label]="
              'Next books, currently showing slide ' +
              (currentSlide + 1) +
              ' of ' +
              totalSlides
            "
            type="button"
          >
            <i class="fas fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Slider Indicators -->
        <div class="slider-indicators" *ngIf="totalSlides > 1">
          <button
            *ngFor="let slide of slidesArray; let i = index"
            class="indicator"
            [class.active]="i === currentSlide"
            (click)="goToSlide(i)"
            [attr.aria-label]="'Go to slide ' + (i + 1)"
          ></button>
        </div>
      </div>
    </div>
  `,
    styles: [
        `
      .popular-books-section {
        margin-bottom: 2rem;
      }

      .section-title {
        color: #333;
        font-weight: 600;
        margin-bottom: 0;
      }

      /* Slider Styles */
      .popular-books-slider {
        margin-top: 1rem;
      }

      .slider-container {
        position: relative;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .slider-wrapper {
        flex: 1;
        overflow: hidden;
        border-radius: 12px;
        min-height: 350px;
      }

      .slider-track {
        opacity: 1;
        transition: opacity 0.3s ease;
      }

      .slider-track.changing {
        opacity: 0.7;
      }

      .slider-track {
        display: flex;
        gap: 1.5rem;
        justify-content: flex-start;
        align-items: stretch;
      }

      .slider-btn {
        background: white;
        border: 2px solid #e9ecef;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #6c757d;
        flex-shrink: 0;
      }

      .slider-btn:hover:not(:disabled) {
        background: #007bff;
        color: white;
        border-color: #007bff;
        transform: scale(1.1);
      }

      .slider-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .slider-btn i {
        font-size: 0.9rem;
      }

      .popular-book-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        width: calc(25% - 1.125rem); /* 4 cards per slide with gap */
        min-width: 200px;
      }

      .popular-book-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        text-decoration: none;
        color: inherit;
      }

      .popular-book-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        text-decoration: none;
        color: inherit;
      }

      .book-thumbnail {
        position: relative;
        height: 240px;
        overflow: hidden;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }

      .book-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .popular-book-card:hover .book-image {
        transform: scale(1.05);
      }

      .rank-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
        color: #333;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        border: 2px solid white;
      }

      .book-info {
        padding: 1rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }

      .book-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .book-author {
        color: #666;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .book-genres {
        margin-top: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        align-items: center;
      }

      .genre-badge {
        background: #e9ecef;
        color: #495057;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 0.7rem;
        font-weight: 500;
      }

      .more-genres {
        color: #6c757d;
        font-size: 0.7rem;
      }

      /* Slider Indicators */
      .slider-indicators {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: none;
        background: #dee2e6;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .indicator.active {
        background: #007bff;
        transform: scale(1.2);
      }

      .indicator:hover {
        background: #6c757d;
      }

      /* Loading and Error States */
      .spinner-border {
        width: 2rem;
        height: 2rem;
      }

      .alert {
        border-radius: 12px;
        border: none;
      }

      .alert i {
        color: #856404;
      }

      /* Responsive Design */
      @media (max-width: 1200px) {
        .popular-book-card {
          width: calc(33.333% - 1rem); /* 3 cards per slide */
          min-width: 180px;
        }

        .slider-track {
          gap: 1.25rem;
        }
      }

      @media (max-width: 768px) {
        .popular-book-card {
          width: calc(50% - 0.5rem); /* 2 cards per slide */
          min-width: 160px;
        }

        .slider-track {
          gap: 1rem;
        }

        .book-thumbnail {
          height: 200px;
        }

        .book-info {
          padding: 0.75rem;
        }

        .book-title {
          font-size: 0.9rem;
        }

        .book-author {
          font-size: 0.8rem;
        }

        .slider-btn {
          width: 35px;
          height: 35px;
        }

        .slider-btn i {
          font-size: 0.8rem;
        }
      }

      @media (max-width: 576px) {
        .popular-book-card {
          width: 100%; /* 1 card per slide */
          min-width: 140px;
        }

        .slider-track {
          gap: 0.75rem;
        }

        .book-thumbnail {
          height: 180px;
        }

        .book-info {
          padding: 0.5rem;
        }

        .book-title {
          font-size: 0.85rem;
          -webkit-line-clamp: 2;
        }

        .book-author {
          font-size: 0.75rem;
        }

        .rank-badge {
          font-size: 0.7rem;
          padding: 2px 6px;
        }

        .slider-btn {
          width: 30px;
          height: 30px;
        }

        .slider-btn i {
          font-size: 0.7rem;
        }

        .slider-container {
          gap: 0.5rem;
        }
      }

      /* Touch device optimizations */
      @media (hover: none) and (pointer: coarse) {
        .popular-book-card:hover {
          transform: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .popular-book-card:active {
          transform: scale(0.98);
        }

        .slider-btn:hover:not(:disabled) {
          transform: none;
        }
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .popular-book-card {
          border: 2px solid #333;
        }

        .rank-badge {
          background: #000 !important;
          color: #fff !important;
          border-color: #fff;
        }

        .genre-badge {
          background: #333;
          color: #fff;
        }

        .slider-btn {
          border-color: #333;
        }

        .indicator {
          background: #333;
        }

        .indicator.active {
          background: #000;
        }
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .popular-book-card,
        .book-image,
        .slider-track,
        .slider-btn,
        .indicator {
          transition: none;
        }

        .popular-book-card:hover {
          transform: none;
        }

        .slider-btn:hover:not(:disabled) {
          transform: none;
        }
      }
    `,
    ]
})
export class PopularBooksSectionComponent implements OnInit {
  popularBooks: Book[] = [];
  isLoading = false;
  hasError = false;

  // Slider properties
  currentSlide = 0;
  booksPerSlide: number = APP_CONSTANTS.POPULAR_BOOKS.BOOKS_PER_SLIDE.LARGE;

  // Constants
  readonly defaultPlaceholder = APP_CONSTANTS.DEFAULT_BOOK_PLACEHOLDER;

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  // Responsive breakpoints
  private updateBooksPerSlide(): void {
    this.booksPerSlide = SliderUtil.calculateItemsPerSlide(
      window.innerWidth,
      APP_CONSTANTS.POPULAR_BOOKS.BREAKPOINTS,
      APP_CONSTANTS.POPULAR_BOOKS.BOOKS_PER_SLIDE
    );
  }

  ngOnInit(): void {
    this.updateBooksPerSlide();
    this.loadPopularBooks();
  }

  /**
   * Loads popular books from the service and handles loading/error states
   */
  loadPopularBooks(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    this.bookService
      .getPopularBooks(APP_CONSTANTS.POPULAR_BOOKS.DEFAULT_LIMIT)
      .subscribe({
        next: (books) => {
          this.popularBooks = books;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error("Error loading popular books:", error);
          this.hasError = true;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  // Slider computed properties
  get maxSlide(): number {
    return SliderUtil.calculateMaxSlide(this.totalSlides);
  }

  get totalSlides(): number {
    return SliderUtil.calculateTotalSlides(
      this.popularBooks.length,
      this.booksPerSlide
    );
  }

  get slidesArray(): number[] {
    return SliderUtil.createSlideIndicators(this.totalSlides);
  }

  get slideWidth(): number {
    // Each slide moves by 100% of the visible area
    return 100;
  }

  // Cached current slide books to avoid unnecessary recalculations
  private _currentSlideBooks: Book[] = [];
  private _lastSlideIndex = -1;
  private _lastBooksPerSlide = -1;

  get currentSlideBooks(): Book[] {
    // Only recalculate if slide or items per slide changed
    if (
      this.currentSlide !== this._lastSlideIndex ||
      this.booksPerSlide !== this._lastBooksPerSlide
    ) {
      this._currentSlideBooks = SliderUtil.getSlideItems(
        this.popularBooks,
        this.currentSlide,
        this.booksPerSlide
      );
      this._lastSlideIndex = this.currentSlide;
      this._lastBooksPerSlide = this.booksPerSlide;
    }
    return this._currentSlideBooks;
  }

  // Method to calculate the rank for a book in the current slide
  getRankForBook(slideIndex: number): number {
    return this.currentSlide * this.booksPerSlide + slideIndex + 1;
  }

  // Slider navigation methods
  previousSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.cdr.markForCheck();
    }
  }

  nextSlide(): void {
    if (this.currentSlide < this.maxSlide) {
      this.currentSlide++;
      this.cdr.markForCheck();
    }
  }

  goToSlide(slideIndex: number): void {
    if (slideIndex >= 0 && slideIndex <= this.maxSlide) {
      this.currentSlide = slideIndex;
      this.cdr.markForCheck();
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(): void {
    const oldBooksPerSlide = this.booksPerSlide;
    this.updateBooksPerSlide();

    // Adjust current slide if needed to prevent showing empty space
    if (this.booksPerSlide !== oldBooksPerSlide) {
      this.currentSlide = SliderUtil.adjustSlideIndex(
        this.currentSlide,
        this.popularBooks.length,
        this.booksPerSlide
      );
    }
  }
}
