import { Component, OnInit, OnDestroy } from "@angular/core";

import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { BookApi } from '../../../services/book-api';
import { LibraryApi } from '../../../services/library-api';
import { AuthStore } from '../../../services/auth-store';
import { LibraryEvents } from '../../../services/library-events';
import { Book } from "../../../models/book.model";
import { UserBook } from "../../../models/library.model";
import { BookDetailsHeaderComponent } from './book-details-header/book-details-header';
import { BookLibraryActionsComponent } from './book-library-actions/book-library-actions';
import { BookReviewsComponent } from './book-reviews/book-reviews';
import { SimilarBooksComponent } from './similar-books/similar-books';

@Component({
    selector: "app-book-details",
    imports: [
    RouterModule,
    BookDetailsHeaderComponent,
    BookLibraryActionsComponent,
    BookReviewsComponent,
    SimilarBooksComponent
],
    template: `
    <div class="container mt-4">
      @if (book) {
        <div>
          <div class="col-12">
            <button class="btn btn-outline-secondary mb-3" (click)="goBack()">
              <i class="fas fa-arrow-left me-2"></i>Back to Catalog
            </button>
          </div>
          <app-book-details-header
            [book]="book"
            [defaultPlaceholder]="defaultPlaceholder">
          </app-book-details-header>
          <app-book-library-actions
            [book]="book"
            [userBook]="userBook"
            [isAuthenticated]="isAuthenticated"
            [addingToLibrary]="addingToLibrary"
            [removingFromLibrary]="removingFromLibrary"
            [togglingFavorite]="togglingFavorite"
            [libraryMessage]="libraryMessage"
            [error]="error"
            (addToLibrary)="addToLibrary($event)"
            (removeFromLibrary)="removeFromLibrary()"
            (toggleFavorite)="toggleFavorite()"
            (statusChanged)="onStatusChanged($event)"
            (recommend)="startRecommendation()">
          </app-book-library-actions>
          <app-similar-books
            [similarBooks]="similarBooks"
            (navigateToBook)="navigateToSimilar($event)">
          </app-similar-books>
          <app-book-reviews
            [reviews]="reviews"
            [loadingReviews]="loadingReviews"
            [hasMoreReviews]="hasMoreReviews"
            (loadMoreReviews)="loadMoreReviews()">
          </app-book-reviews>
        </div>
      } @else {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    
    </div>
    `
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  private static readonly MESSAGE_TIMEOUT_MS = 5000;
  private static readonly DEFAULT_BOOK_PLACEHOLDER = "/assets/images/book-placeholder.svg";

  book: Book | null = null;
  userBook: UserBook | null = null;
  error: string | null = null;
  addingToLibrary = false;
  removingFromLibrary = false;
  togglingFavorite = false;
  libraryMessage: string | null = null;
  private destroy$ = new Subject<void>();
  private viewRecorded = false;
  similarBooks: Book[] = [];
  reviews: UserBook[] = [];
  loadingReviews = false;
  reviewPage = 0;
  reviewPageSize = 5;
  hasMoreReviews = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookApi: BookApi,
    private libraryApi: LibraryApi,
    private authStore: AuthStore,
    private libraryEvents: LibraryEvents
  ) {}

  get isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  get defaultPlaceholder(): string {
    return BookDetailsComponent.DEFAULT_BOOK_PLACEHOLDER;
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const bookId = +params["id"];
      if (bookId) {
        this.viewRecorded = false;
        this.loadBook(bookId);
      }
    });

    this.authStore.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated && this.book) {
          this.checkLibraryStatus(this.book.id);
        } else if (!isAuthenticated) {
          this.userBook = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBook(bookId?: number): void {
    const id = bookId || +this.route.snapshot.params["id"];
    this.error = null;

    this.bookApi
      .getBookById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (book) => {
          this.book = book;
          this.recordBookView(id);
          this.checkLibraryStatus(id);
          this.loadSimilarBooks(id);
          this.resetReviews();
          this.loadReviews();
        },
        error: (error) => {
          console.error("Error loading book:", error);
          this.error = "Failed to load book details. Please try again.";
        },
      });
  }

  private resetReviews(): void {
    this.reviews = [];
    this.reviewPage = 0;
    this.hasMoreReviews = false;
  }

  private loadReviews(): void {
    if (!this.book) return;
    this.loadingReviews = true;
    this.libraryApi.getBookReviews(this.book.id, this.reviewPage, this.reviewPageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: page => {
          this.reviews = [...this.reviews, ...page.content];
          this.hasMoreReviews = !page.last;
          this.loadingReviews = false;
        },
        error: err => { 
          console.warn('Failed to load reviews', err); 
          this.loadingReviews = false; 
        }
      });
  }

  loadMoreReviews(): void {
    if (!this.hasMoreReviews || this.loadingReviews) return;
    this.reviewPage += 1;
    this.loadReviews();
  }

  private loadSimilarBooks(bookId: number): void {
    this.bookApi.getSimilarBooks(bookId, 15)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: books => { this.similarBooks = books; },
        error: err => { console.warn('Failed to load similar books', err); }
      });
  }

  navigateToSimilar(id: number): void {
    this.similarBooks = [];
    this.router.navigate(['/books', id]);
  }

  private checkLibraryStatus(bookId: number): void {
    if (!this.authStore.isAuthenticated()) {
      this.userBook = null;
      return;
    }

    this.libraryApi
      .checkBookInLibrary(bookId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.userBook = result.userBook || null;
        },
        error: (error) => {
          this.userBook = null;
        },
      });
  }

  private recordBookView(bookId: number): void {
    if (this.viewRecorded) return;
    this.viewRecorded = true;

    this.bookApi
      .recordBookView(bookId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {},
        error: (error) => {
          console.warn("Failed to record book view:", error);
        },
      });
  }

  goBack(): void {
    this.router.navigate(["/books"]);
  }

  addToLibrary(status: "read" | "currently_reading" | "to_read"): void {
    if (!this.book || this.addingToLibrary) return;

    if (!this.authStore.isAuthenticated()) {
      this.router.navigate(["/login"], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.addingToLibrary = true;
    this.error = null;

    const request = { bookId: this.book.id, status };
    this.libraryApi
      .addBookToLibrary(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userBook) => {
          this.userBook = userBook;
          this.addingToLibrary = false;
          this.libraryMessage = `Book added to library as "${this.getStatusDisplayText(status)}"`;
          this.clearMessageAfterTimeout();
          this.libraryEvents.notifyLibraryUpdated();
        },
        error: (error) => {
          console.error("Error adding book to library:", error);
          this.addingToLibrary = false;
          this.error = "Failed to add book to library. Please try again.";
        },
      });
  }

  removeFromLibrary(): void {
    if (!this.userBook || this.removingFromLibrary) return;

    this.removingFromLibrary = true;
    this.error = null;

    this.libraryApi
      .removeBookFromLibrary(this.userBook.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.userBook = null;
          this.removingFromLibrary = false;
          this.libraryMessage = "Book removed from library";
          this.clearMessageAfterTimeout();
          this.libraryEvents.notifyLibraryUpdated();
        },
        error: (error) => {
          console.error("Error removing book from library:", error);
          this.removingFromLibrary = false;
          this.error = "Failed to remove book from library. Please try again.";
        },
      });
  }

  toggleFavorite(): void {
    if (!this.userBook || this.togglingFavorite) return;

    this.togglingFavorite = true;
    this.error = null;

    this.libraryApi
      .toggleFavorite(this.userBook.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUserBook) => {
          this.userBook = updatedUserBook;
          this.togglingFavorite = false;
          const action = updatedUserBook.isFavourite ? "added to" : "removed from";
          this.libraryMessage = `Book ${action} favorites`;
          this.clearMessageAfterTimeout();
        },
        error: (error) => {
          console.error("Error toggling favorite:", error);
          this.togglingFavorite = false;
          this.error = "Failed to update favorite status. Please try again.";
        },
      });
  }

  onStatusChanged(updatedUserBook: UserBook): void {
    this.userBook = updatedUserBook;
    this.libraryEvents.notifyLibraryUpdated();
  }

  startRecommendation(): void {
    if (!this.isAuthenticated) {
      this.router.navigate(["/login"], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const base = '/social/recommendations';
    if (this.book) {
      this.router.navigate([base], { queryParams: { bookId: this.book.id, action: 'send' } });
    } else {
      this.router.navigate([base], { queryParams: { action: 'send' } });
    }
  }

  private clearMessageAfterTimeout(): void {
    setTimeout(() => {
      this.libraryMessage = null;
    }, BookDetailsComponent.MESSAGE_TIMEOUT_MS);
  }

  private getStatusDisplayText(status: "read" | "currently_reading" | "to_read"): string {
    const statusMap = {
      read: "Read",
      currently_reading: "Currently Reading",
      to_read: "Want to Read",
    };
    return statusMap[status];
  }
}
