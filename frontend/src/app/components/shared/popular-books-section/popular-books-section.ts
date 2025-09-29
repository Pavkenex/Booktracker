import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgClass } from "@angular/common";

import { BookApi } from "../../../services/book-api";
import { Book } from "../../../models/book.model";
import { APP_CONSTANTS } from "../../../constants/app.constants";
import { SliderComponent } from "../slider/slider.component";
import { SliderItemDirective } from "../slider/slider-item.directive";
import { FallbackImageDirective } from "../../../directives/fallback-image";

@Component({
  selector: "app-popular-books-section",
  imports: [RouterModule, NgClass, FallbackImageDirective, SliderComponent, SliderItemDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./popular-books-section.html",
  styleUrls: ["./popular-books-section.css"],
})
export class PopularBooksSectionComponent implements OnInit {
  popularBooks: Book[] = [];
  isLoading = false;
  hasError = false;

  readonly defaultPlaceholder = APP_CONSTANTS.DEFAULT_BOOK_PLACEHOLDER;
  protected readonly popularBooksConfig = APP_CONSTANTS.POPULAR_BOOKS;

  constructor(
    private readonly bookApi: BookApi,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPopularBooks();
  }

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

  getRank(globalIndex: number): number {
    return globalIndex + 1;
  }

  getRankBadgeClass(rank: number): string {
    if (rank === 1) {
      return "rank-badge--gold";
    }
    if (rank === 2) {
      return "rank-badge--silver";
    }
    if (rank === 3) {
      return "rank-badge--bronze";
    }
    return "rank-badge--default";
  }
}
