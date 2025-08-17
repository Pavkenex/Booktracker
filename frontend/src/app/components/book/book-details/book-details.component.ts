import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { BookService } from "../../../services/book.service";
import { LibraryService } from "../../../services/library.service";
import { AuthService } from "../../../services/auth.service";
import { LibraryEventsService } from "../../../services/library-events.service";
import { Book } from "../../../models/book.model";
import { UserBook } from "../../../models/library.model";
import { BookStatusSelectorComponent } from "../../library/book-status-selector/book-status-selector.component";
import { FallbackImageDirective } from "../../../directives/fallback-image.directive";

@Component({
  selector: "app-book-details",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BookStatusSelectorComponent,
    FallbackImageDirective,
  ],
  template: `
    <div class="container mt-4">
      <div class="row" *ngIf="book; else loading">
        <div class="col-12">
          <button class="btn btn-outline-secondary mb-3" (click)="goBack()">
            <i class="fas fa-arrow-left me-2"></i>Back to Catalog
          </button>
        </div>

        <div class="col-md-4 col-lg-3">
          <div class="book-cover-container">
            <img
              [src]="book.thumbnail || getDefaultPlaceholder()"
              [alt]="book.title"
              class="img-fluid book-cover"
              appFallbackImage
            />
          </div>
        </div>

        <div class="col-md-8 col-lg-9">
          <div class="book-info">
            <h1 class="book-title">{{ book.title }}</h1>
            <h4 class="book-author text-muted mb-3">by {{ book.author }}</h4>

            <div class="book-meta mb-4">
              <div class="row">
                <div class="col-sm-6" *ngIf="book.publishedYear">
                  <strong>Published:</strong> {{ book.publishedYear }}
                </div>
                <div
                  class="col-sm-6"
                  *ngIf="book.genres && book.genres.length > 0"
                >
                  <strong>Genres:</strong>
                  <div class="mt-1">
                    <span
                      *ngFor="let genre of book.genres"
                      class="badge bg-primary me-1"
                    >
                      {{ genre.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="book-description" *ngIf="book.description">
              <h5>Description</h5>
              <p class="lead">{{ book.description }}</p>
            </div>

            <div class="book-actions mt-4">
              <!-- User not authenticated -->
              <div *ngIf="!isAuthenticated" class="text-center">
                <p class="text-muted mb-3">
                  Sign in to add this book to your library
                </p>
                <div class="btn-group" role="group">
                  <a routerLink="/login" class="btn btn-success">
                    <i class="fas fa-sign-in-alt me-2"></i>Sign In
                  </a>
                  <a routerLink="/register" class="btn btn-outline-primary">
                    <i class="fas fa-user-plus me-2"></i>Sign Up
                  </a>
                  <button class="btn btn-outline-info" (click)="startRecommendation()">
                    <i class="fas fa-share me-2"></i>Recommend
                  </button>
                </div>
              </div>

              <!-- User authenticated but book not in library -->
              <div *ngIf="isAuthenticated && !userBook">
                <!-- Desktop / larger screens: split button group -->
                <div class="btn-group dropdown d-none d-sm-inline-flex" role="group">
                  <button
                    class="btn btn-success"
                    (click)="addToLibrary('to_read')"
                    [disabled]="addingToLibrary"
                  >
                    <span *ngIf="addingToLibrary" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!addingToLibrary" class="fas fa-plus me-2"></i>
                    Want to Read
                  </button>
                  <button
                    class="btn btn-success dropdown-toggle dropdown-toggle-split"
                    type="button"
                    (click)="toggleDropdown()"
                    [attr.aria-expanded]="dropdownOpen"
                    [disabled]="addingToLibrary"
                  >
                    <span class="visually-hidden">Toggle Dropdown</span>
                  </button>
                  <ul class="dropdown-menu" [class.show]="dropdownOpen">
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('to_read')">
                        <i class="fas fa-plus me-2 text-success"></i>Want to Read
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('currently_reading')">
                        <i class="fas fa-book-open me-2 text-warning"></i>Currently Reading
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('read')">
                        <i class="fas fa-check me-2 text-primary"></i>Mark as Read
                      </a>
                    </li>
                  </ul>
                  <button class="btn btn-outline-info">
                    <i class="fas fa-share me-2"></i>Recommend
                  </button>
                </div>
                <!-- Mobile: single full-width dropdown button -->
                <div class="dropdown d-sm-none">
                  <button
                    class="btn btn-success w-100"
                    type="button"
                    (click)="toggleDropdown()"
                    [attr.aria-expanded]="dropdownOpen"
                    [disabled]="addingToLibrary"
                  >
                    <span *ngIf="addingToLibrary" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!addingToLibrary" class="fas fa-plus me-2"></i>
                    Add to Library
                    <i class="fas fa-caret-down ms-2"></i>
                  </button>
                  <ul class="dropdown-menu w-100 mobile-dropdown" [class.show]="dropdownOpen">
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('to_read')">
                        <i class="fas fa-plus me-2 text-success"></i>Want to Read
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('currently_reading')">
                        <i class="fas fa-book-open me-2 text-warning"></i>Currently Reading
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#" (click)="$event.preventDefault(); selectOption('read')">
                        <i class="fas fa-check me-2 text-primary"></i>Mark as Read
                      </a>
                    </li>
                  </ul>
                  <button class="btn btn-outline-info w-100 mt-2" (click)="startRecommendation()">
                    <i class="fas fa-share me-2"></i>Recommend
                  </button>
                </div>
              </div>

              <!-- User authenticated and book already in library -->
              <div
                *ngIf="isAuthenticated && userBook"
                class="library-status-section"
              >
                <div class="alert alert-info d-flex align-items-center mb-3">
                  <i class="fas fa-book me-2"></i>
                  <span>This book is in your library</span>
                  <button
                    class="btn btn-sm btn-outline-danger ms-auto"
                    (click)="removeFromLibrary()"
                    [disabled]="removingFromLibrary"
                  >
                    <span
                      *ngIf="removingFromLibrary"
                      class="spinner-border spinner-border-sm me-1"
                    ></span>
                    <i
                      *ngIf="!removingFromLibrary"
                      class="fas fa-trash me-1"
                    ></i>
                    Remove
                  </button>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <app-book-status-selector
                      [userBook]="userBook"
                      (statusChanged)="onStatusChanged($event)"
                    >
                    </app-book-status-selector>
                  </div>
                  <div class="col-md-6">
                    <div class="favorite-toggle">
                      <button
                        class="btn btn-sm"
                        [class.btn-danger]="userBook.isFavourite"
                        [class.btn-outline-secondary]="!userBook.isFavourite"
                        (click)="toggleFavorite()"
                        [disabled]="togglingFavorite"
                      >
                        <span
                          *ngIf="togglingFavorite"
                          class="spinner-border spinner-border-sm me-1"
                        ></span>
                        <i
                          *ngIf="!togglingFavorite"
                          class="fas fa-heart me-1"
                        ></i>
                        {{
                          userBook.isFavourite
                            ? "Remove from Favorites"
                            : "Add to Favorites"
                        }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mt-3">
                  <div class="btn-group" role="group">
                    <a routerLink="/library" class="btn btn-outline-primary">
                      <i class="fas fa-book-open me-2"></i>View Library
                    </a>
                    <button class="btn btn-outline-info" (click)="startRecommendation()">
                      <i class="fas fa-share me-2"></i>Recommend
                    </button>
                  </div>
                </div>
              </div>

              <!-- Success Message -->
              <div
                *ngIf="libraryMessage"
                class="alert alert-success mt-3"
                role="alert"
              >
                <i class="fas fa-check-circle me-2"></i>{{ libraryMessage }}
                <a routerLink="/library" class="alert-link ms-2"
                  >View Library</a
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div
          class="d-flex justify-content-center align-items-center"
          style="min-height: 400px;"
        >
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </ng-template>

      <div class="alert alert-danger mt-4" *ngIf="error">
        <h5>Error Loading Book</h5>
        <p>{{ error }}</p>
        <button class="btn btn-outline-danger" (click)="loadBook()">
          Try Again
        </button>
      </div>

      <!-- Similar Books -->
      <div *ngIf="book && similarBooks.length > 0" class="similar-section mt-5">
        <h3 class="mb-3">Similar Books</h3>
        <div class="similar-slider-wrapper d-flex align-items-center">
          <button class="slider-btn btn btn-outline-secondary me-2" (click)="scrollSimilar('prev')" aria-label="Previous">
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="similar-slider flex-grow-1" #similarSlider>
            <div class="similar-item" *ngFor="let b of similarBooks">
              <a [routerLink]="['/books', b.id]" (click)="navigateToSimilar(b.id)" class="text-decoration-none">
                <div class="thumb-wrapper mb-2">
                  <img [src]="b.thumbnail || getDefaultPlaceholder()" [alt]="b.title" class="img-fluid rounded" />
                </div>
                <div class="small fw-semibold text-dark text-truncate" [title]="b.title">{{ b.title }}</div>
                <div class="small text-muted text-truncate" *ngIf="b.author" [title]="b.author">{{ b.author }}</div>
              </a>
            </div>
          </div>
          <button class="slider-btn btn btn-outline-secondary ms-2" (click)="scrollSimilar('next')" aria-label="Next">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Reviews Section -->
      <div *ngIf="book" class="reviews-section mt-5">
        <h3 class="mb-3">Recent Reviews</h3>
        <div *ngIf="loadingReviews" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div *ngIf="!loadingReviews && reviews.length === 0" class="text-muted">No reviews yet.</div>
        <div class="list-group">
          <div class="list-group-item" *ngFor="let r of reviews">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <div>
                <span class="badge bg-warning text-dark me-2" *ngIf="r.rating">{{ r.rating }}★</span>
                <span class="fw-semibold" *ngIf="r.username">&#64;{{ r.username }}</span>
              </div>
              <small class="text-muted" *ngIf="r.readDate">{{ r.readDate | date:'mediumDate' }}</small>
            </div>
            <div *ngIf="r.review" class="review-text">{{ r.review }}</div>
            <div class="small text-muted mt-1">Status: {{ r.status.replace('_',' ') }}</div>
          </div>
        </div>
        <div class="mt-3 text-center" *ngIf="hasMoreReviews">
          <button class="btn btn-outline-primary btn-sm" (click)="loadMoreReviews()" [disabled]="loadingReviews">Show More</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .book-cover-container {
        text-align: center;
        margin-bottom: 2rem;
      }

      .book-cover {
        max-height: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .book-title {
        color: #333;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .book-author {
        font-style: italic;
      }

      .book-meta {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
      }

      .book-description {
        margin-top: 2rem;
      }

      .book-actions {
        border-top: 1px solid #dee2e6;
        padding-top: 1rem;
      }

      .library-status-section {
        width: 100%;
      }

      .favorite-toggle {
        text-align: right;
      }

      .dropdown-toggle-split {
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }

      .dropdown-menu {
        min-width: 180px;
      }

      .dropdown-item {
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
      }

      .dropdown-item:hover {
        background-color: #f8f9fa;
      }

      .dropdown-item i {
        width: 20px;
      }

      .dropdown {
        position: relative;
      }

      .dropdown-menu.show {
        display: block;
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1000;
      }
  .mobile-dropdown { position: static !important; float:none; margin-top:.25rem; }

      .badge {
        font-size: 0.8rem;
      }

      @media (max-width: 768px) {
        .book-cover {
          max-height: 300px;
        }

        .btn-group {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .btn-group .btn {
          margin-bottom: 0.5rem;
          border-radius: 0.375rem !important;
        }
      }

      /* Similar books slider */
      .similar-section {
        border-top: 1px solid #dee2e6;
        padding-top: 2rem;
      }
      .similar-slider-wrapper { position: relative; }
      .similar-slider { display: flex; overflow-x: auto; scroll-behavior: smooth; gap: 1rem; padding-bottom: .5rem; }
      .similar-slider::-webkit-scrollbar { height: 8px; }
      .similar-slider::-webkit-scrollbar-track { background: #f1f1f1; }
      .similar-slider::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
      .similar-item { flex: 0 0 140px; max-width: 140px; }
      .thumb-wrapper { width: 100%; aspect-ratio: 2/3; overflow: hidden; background:#f8f9fa; display:flex; align-items:center; justify-content:center; }
      .thumb-wrapper img { width:100%; height:100%; object-fit:cover; }
      @media (min-width: 576px) { .similar-item { flex: 0 0 160px; max-width:160px; } }
      .slider-btn { width: 40px; height: 40px; display:flex; align-items:center; justify-content:center; }
  .reviews-section { border-top:1px solid #dee2e6; padding-top:2rem; }
  .review-text { white-space: pre-wrap; }
    `,
  ],
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  private static readonly MESSAGE_TIMEOUT_MS = 5000;
  private static readonly DEFAULT_BOOK_PLACEHOLDER =
    "/assets/images/book-placeholder.svg";

  book: Book | null = null;
  userBook: UserBook | null = null;
  error: string | null = null;
  addingToLibrary = false;
  dropdownOpen = false;
  removingFromLibrary = false;
  togglingFavorite = false;
  libraryMessage: string | null = null;
  private destroy$ = new Subject<void>();
  private viewRecorded = false; // Track if view has been recorded for this page visit
  similarBooks: Book[] = [];
  @ViewChild('similarSlider') similarSlider?: ElementRef<HTMLElement>;
  reviews: UserBook[] = [];
  loadingReviews = false;
  reviewPage = 0;
  reviewPageSize = 5;
  hasMoreReviews = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private libraryService: LibraryService,
    private authService: AuthService,
    private libraryEventsService: LibraryEventsService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const bookId = +params["id"];
      if (bookId) {
        // Reset view tracking for new book
        this.viewRecorded = false;
        this.loadBook(bookId);
      }
    });

    // Listen for authentication changes
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated) => {
        if (isAuthenticated && this.book) {
          // User just logged in, check library status
          this.checkLibraryStatus(this.book.id);
        } else if (!isAuthenticated) {
          // User logged out, clear library status
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

    // First load the book details
    this.bookService
      .getBookById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (book) => {
          this.book = book;
          // Record view only once per page visit
          this.recordBookView(id);
          // Then check library status (this might fail if user is not authenticated)
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
    this.libraryService.getBookReviews(this.book.id, this.reviewPage, this.reviewPageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: page => {
          this.reviews = [...this.reviews, ...page.content];
          this.hasMoreReviews = !page.last;
          this.loadingReviews = false;
        },
        error: err => { console.warn('Failed to load reviews', err); this.loadingReviews = false; }
      });
  }

  loadMoreReviews(): void {
    if (!this.hasMoreReviews || this.loadingReviews) return;
    this.reviewPage += 1;
    this.loadReviews();
  }

  private loadSimilarBooks(bookId: number): void {
    this.bookService.getSimilarBooks(bookId, 15)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: books => { this.similarBooks = books; },
        error: err => { console.warn('Failed to load similar books', err); }
      });
  }

  scrollSimilar(direction: 'prev' | 'next'): void {
    const el = this.similarSlider?.nativeElement;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'next' ? amount : -amount, behavior: 'smooth' });
  }

  navigateToSimilar(id: number): void {
    // Reset similar books to avoid flicker while loading new book
    this.similarBooks = [];
  }

  private checkLibraryStatus(bookId: number): void {
    // Only check library status if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.userBook = null;
      return;
    }

    this.libraryService
      .checkBookInLibrary(bookId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.userBook = result.userBook || null;
        },
        error: (error) => {
          // If library check fails, just set userBook to null
          console.log("Library status check failed:", error);
          this.userBook = null;
        },
      });
  }

  private recordBookView(bookId: number): void {
    // Only record view once per page visit
    if (this.viewRecorded) {
      return;
    }

    this.viewRecorded = true;

    // Record the book view asynchronously and handle errors silently
    this.bookService
      .recordBookView(bookId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // View recorded successfully - no user feedback needed
        },
        error: (error) => {
          // Handle view recording errors silently without affecting user experience
          console.warn("Failed to record book view:", error);
          // Don't show error to user or affect page functionality
        },
      });
  }

  goBack(): void {
    this.router.navigate(["/books"]);
  }

  // Image error handling is now handled by the FallbackImageDirective

  addToLibrary(status: "read" | "currently_reading" | "to_read"): void {
    if (!this.book || this.addingToLibrary) {
      return;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(["/login"], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.addingToLibrary = true;
    this.libraryMessage = null;

    const request = {
      bookId: this.book.id,
      status: status,
      isFavourite: false,
    };

    this.libraryService
      .addBookToLibrary(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userBook) => {
          this.addingToLibrary = false;
          this.userBook = userBook;
          const statusText = this.getStatusDisplayText(status);
          this.libraryMessage = `"${
            this.book!.title
          }" has been added to your ${statusText} list!`;

          // Notify that library has been updated
          this.libraryEventsService.notifyLibraryUpdated();

          // Clear message after timeout
          this.clearMessageAfterTimeout();
        },
        error: (error) => {
          console.error("Error adding book to library:", error);
          this.addingToLibrary = false;
          this.error = "Failed to add book to library. Please try again.";
        },
      });
  }

  removeFromLibrary(): void {
    if (!this.userBook || this.removingFromLibrary) {
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove "${
          this.book!.title
        }" from your library?`
      )
    ) {
      return;
    }

    this.removingFromLibrary = true;
    this.libraryMessage = null;

    this.libraryService
      .removeBookFromLibrary(this.userBook.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.removingFromLibrary = false;
          this.userBook = null;
          this.libraryMessage = `"${
            this.book!.title
          }" has been removed from your library.`;

          // Notify that library has been updated
          this.libraryEventsService.notifyLibraryUpdated();

          // Clear message after timeout
          this.clearMessageAfterTimeout();
        },
        error: (error) => {
          console.error("Error removing book from library:", error);
          this.removingFromLibrary = false;
          this.error = "Failed to remove book from library. Please try again.";
        },
      });
  }

  toggleFavorite(): void {
    if (!this.userBook || this.togglingFavorite) {
      return;
    }

    this.togglingFavorite = true;

    this.libraryService
      .toggleFavorite(this.userBook.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUserBook) => {
          this.togglingFavorite = false;
          this.userBook = updatedUserBook;
          // Notify that library has been updated
          this.libraryEventsService.notifyLibraryUpdated();
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
    // Notify that library has been updated
    this.libraryEventsService.notifyLibraryUpdated();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectOption(status: "read" | "currently_reading" | "to_read"): void {
    this.dropdownOpen = false;
    this.addToLibrary(status);
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest(".dropdown");
    if (!dropdown && this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getDefaultPlaceholder(): string {
    return BookDetailsComponent.DEFAULT_BOOK_PLACEHOLDER;
  }

  private clearMessageAfterTimeout(): void {
    setTimeout(() => {
      this.libraryMessage = null;
    }, BookDetailsComponent.MESSAGE_TIMEOUT_MS);
  }

  private getStatusDisplayText(
    status: "read" | "currently_reading" | "to_read"
  ): string {
    const statusMap = {
      read: "Read",
      currently_reading: "Currently Reading",
      to_read: "Want to Read",
    };
    return statusMap[status];
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
}
