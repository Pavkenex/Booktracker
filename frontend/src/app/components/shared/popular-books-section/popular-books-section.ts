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
  slideGroups: Book[][] = [];

  // Constants
  readonly defaultPlaceholder = APP_CONSTANTS.DEFAULT_BOOK_PLACEHOLDER;

  constructor(
    private bookApi: BookApi,
    private cdr: ChangeDetectorRef
  ) {}

  // Responsive breakpoints
  private updateBooksPerSlide(): void {
    const calculated = SliderUtil.calculateItemsPerSlide(
      window.innerWidth,
      APP_CONSTANTS.POPULAR_BOOKS.BREAKPOINTS,
      APP_CONSTANTS.POPULAR_BOOKS.BOOKS_PER_SLIDE
    );
    if (calculated !== this.booksPerSlide) {
      this.booksPerSlide = calculated;
      this.rebuildSlideGroups();
    }
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
          this.rebuildSlideGroups();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error("Error loading popular books:", error);
          this.hasError = true;
          this.isLoading = false;
          this.slideGroups = [];
          this.currentSlide = 0;
          this.cdr.markForCheck();
        },
      });
  }

  private rebuildSlideGroups(): void {
    if (!this.popularBooks.length || this.booksPerSlide <= 0) {
      this.slideGroups = [];
      this.currentSlide = 0;
      return;
    }

    const groups: Book[][] = [];
    const totalSlides = SliderUtil.calculateTotalSlides(
      this.popularBooks.length,
      this.booksPerSlide
    );

    for (let i = 0; i < totalSlides; i++) {
      groups.push(
        SliderUtil.getSlideItems(this.popularBooks, i, this.booksPerSlide)
      );
    }

    this.slideGroups = groups;
    this.currentSlide = SliderUtil.adjustSlideIndex(
      this.currentSlide,
      this.popularBooks.length,
      this.booksPerSlide
    );
  }

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  trackBySlide(index: number): number {
    return index;
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

  get trackTransform(): string {
    if (this.slideGroups.length <= 1) {
      return 'translateX(0)';
    }

    const step = 100 / this.slideGroups.length;
    const offset = this.currentSlide * step;
    return `translateX(-${offset}%)`;
  }

  get trackWidthPercent(): number {
    return Math.max(this.slideGroups.length, 1) * 100;
  }

  get slideWidthPercent(): number {
    return this.slideGroups.length > 0 ? 100 / this.slideGroups.length : 100;
  }

  // Method to calculate the rank for a book within a slide
  getRankForBook(slideIndex: number, bookIndex: number): number {
    return slideIndex * this.booksPerSlide + bookIndex + 1;
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
    this.updateBooksPerSlide();
  }
}
