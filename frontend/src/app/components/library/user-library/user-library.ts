import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { LibraryService } from "../../../services/library.service";
import { SocialService } from "../../../services/social.service";
import { UserBook } from "../../../models/library.model";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-user-library",
    imports: [CommonModule],
    template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i class="fas fa-book-open me-2"></i>
              {{ userName }}'s Library
            </h2>
            <button class="btn btn-outline-secondary" (click)="goBack()">
              <i class="fas fa-arrow-left me-2"></i>Back
            </button>
          </div>
    
          <!-- Loading State -->
          @if (isLoading) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">Loading library...</p>
            </div>
          }
    
          <!-- Error State -->
          @if (error) {
            <div class="alert alert-danger" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ error }}
            </div>
          }
    
          <!-- Library Content -->
          @if (!isLoading && !error) {
            <div>
              <!-- Library Stats -->
              <div class="row mb-4">
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                      <h4 class="card-title">{{ totalBooks }}</h4>
                      <p class="card-text">Total Books</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-success text-white">
                    <div class="card-body text-center">
                      <h4 class="card-title">{{ completedBooks }}</h4>
                      <p class="card-text">Completed</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-warning text-white">
                    <div class="card-body text-center">
                      <h4 class="card-title">{{ currentlyReadingBooks }}</h4>
                      <p class="card-text">Currently Reading</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-info text-white">
                    <div class="card-body text-center">
                      <h4 class="card-title">{{ wantToReadBooks }}</h4>
                      <p class="card-text">Want to Read</p>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Books List -->
              @if (books.length > 0) {
                <div>
                  <div class="row">
                    @for (userBook of books; track userBook) {
                      <div
                        class="col-lg-4 col-md-6 mb-4"
                        >
                        <div class="card h-100">
                          <div class="card-body">
                            <div class="d-flex">
                              <img
                          [src]="
                            userBook.book.thumbnail ||
                            '/assets/images/book-placeholder.png'
                          "
                                [alt]="userBook.book.title"
                                class="book-cover me-3"
                                style="width: 80px; height: 120px; object-fit: cover;"
                                />
                                <div class="flex-grow-1">
                                  <h6 class="card-title">{{ userBook.book.title }}</h6>
                                  <p class="card-text text-muted small mb-2">
                                    by {{ userBook.book.author }}
                                  </p>
                                  <div class="mb-2">
                                    <span
                                      class="badge"
                                      [ngClass]="getStatusBadgeClass(userBook.status)"
                                      >
                                      {{ getStatusDisplayName(userBook.status) }}
                                    </span>
                                    @if (userBook.isFavourite) {
                                      <span
                                        class="badge bg-warning ms-1"
                                        >
                                        <i class="fas fa-heart"></i> Favorite
                                      </span>
                                    }
                                  </div>
                                  @if (userBook.rating && userBook.rating > 0) {
                                    <div
                                      class="mb-2"
                                      >
                                      <div class="text-warning">
                                        @for (
                                          star of getStarArray(userBook.rating)
                                          ; track
                                          star) {
                                          <i
                                            class="fas fa-star"
                                          ></i>
                                        }
                                        @for (
                                          star of getEmptyStarArray(userBook.rating)
                                          ; track
                                          star) {
                                          <i
                                            class="far fa-star"
                                          ></i>
                                        }
                                      </div>
                                    </div>
                                  }
                                  @if (userBook.review) {
                                    <div class="small text-muted">
                                      <strong>Review:</strong>
                                      <p class="mb-0 mt-1">{{ userBook.review }}</p>
                                    </div>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
                <!-- Empty State -->
                @if (books.length === 0) {
                  <div class="text-center py-5">
                    <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No books in library</h4>
                    <p class="text-muted">
                      {{ userName }} hasn't added any books to their library yet.
                    </p>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    `,
    styleUrls: ["./user-library.component.css"]
})
export class UserLibraryComponent implements OnInit, OnDestroy {
  books: UserBook[] = [];
  userName: string = "";
  userId: number = 0;
  isLoading: boolean = false;
  error: string = "";

  private destroy$ = new Subject<void>();

  // Stats
  totalBooks: number = 0;
  completedBooks: number = 0;
  currentlyReadingBooks: number = 0;
  wantToReadBooks: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private libraryService: LibraryService,
    private socialService: SocialService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.userId = +params["userId"];
      this.userName = params["userName"] || "User";
      this.loadUserLibrary();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserLibrary(): void {
    this.isLoading = true;
    this.error = "";

    this.libraryService
      .getUserLibrary(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          this.books = books;
          this.calculateStats();
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Error loading user library:", error);
          if (error.status === 403) {
            this.error = "You can only view libraries of your friends.";
          } else {
            this.error = "Failed to load library. Please try again.";
          }
          this.isLoading = false;
        },
      });
  }

  calculateStats(): void {
    this.totalBooks = this.books.length;
    this.completedBooks = this.books.filter(
      (book) => book.status === "read"
    ).length;
    this.currentlyReadingBooks = this.books.filter(
      (book) => book.status === "currently_reading"
    ).length;
    this.wantToReadBooks = this.books.filter(
      (book) => book.status === "to_read"
    ).length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case "read":
        return "bg-success";
      case "currently_reading":
        return "bg-warning";
      case "to_read":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case "read":
        return "Completed";
      case "currently_reading":
        return "Currently Reading";
      case "to_read":
        return "Want to Read";
      default:
        return status;
    }
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStarArray(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  goBack(): void {
    this.router.navigate(["/social/friends"]);
  }
}
