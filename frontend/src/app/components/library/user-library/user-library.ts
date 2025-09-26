import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LibraryApi } from '../../../services/library-api';
import { UserBook } from "../../../models/library.model";
import { UserLibraryBooksComponent } from './user-library-books/user-library-books';
import { UserLibraryStatsComponent, UserLibraryStatsSummary } from './user-library-stats/user-library-stats';

@Component({
    selector: "app-user-library",
    imports: [CommonModule, UserLibraryStatsComponent, UserLibraryBooksComponent],
    templateUrl: './user-library.html',
    styleUrls: ['./user-library.css']
})
export class UserLibraryComponent implements OnInit {
  books: UserBook[] = [];
  userName: string = "";
  userId: number = 0;
  isLoading: boolean = false;
  error: string = "";

  // Stats
  stats: UserLibraryStatsSummary | null = null;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private libraryApi: LibraryApi
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.userId = +params["userId"];
        this.userName = params["userName"] || "User";
        this.loadUserLibrary();
      });
  }

  loadUserLibrary(): void {
    this.isLoading = true;
    this.error = "";

    this.libraryApi
      .getUserLibrary(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
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
          this.stats = null;
        },
      });
  }

  calculateStats(): void {
    this.stats = {
      total: this.books.length,
      read: this.books.filter((book) => book.status === "read").length,
      currentlyReading: this.books.filter((book) => book.status === "currently_reading").length,
      toRead: this.books.filter((book) => book.status === "to_read").length
    };
  }

  goBack(): void {
    this.router.navigate(["/social/friends"]);
  }
}
