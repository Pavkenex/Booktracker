import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { LibraryApi } from '../../../services/library-api';
import { SocialApi } from '../../../services/social-api';
import { UserBook } from "../../../models/library.model";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
    selector: "app-user-library",
    imports: [CommonModule],
    templateUrl: './user-library.html',
    styleUrls: ['./user-library.css']
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
    private libraryApi: LibraryApi,
    private socialApi: SocialApi
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

    this.libraryApi
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
    this.router.navigate(["/social"]);
  }
}
