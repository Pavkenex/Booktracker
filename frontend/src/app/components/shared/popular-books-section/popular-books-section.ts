import {
  Component,
  OnInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from "@angular/core";

import { RouterModule } from "@angular/router";
import { BookApi } from '../../../services/book-api';
import { Book } from "../../../models/book.model";
import { APP_CONSTANTS } from "../../../constants/app.constants";
import { SliderUtil } from "../../../utils/slider.util";
import { FallbackImageDirective } from '../../../directives/fallback-image';

@Component({
    selector: "app-popular-books-section",
    imports: [RouterModule, FallbackImageDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './popular-books-section.html',
    styleUrls: ['./popular-books-section.css']
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
    private bookApi: BookApi,
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

    this.bookApi
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
