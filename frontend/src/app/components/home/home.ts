import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthStore, User } from "../../services/auth-store";
import { SocialApi } from "../../services/social-api";
import { Recommendation } from "../../models/social.model";
import { Observable } from "rxjs";
import { PopularBooksSectionComponent } from "../shared/popular-books-section/popular-books-section";
import { RecommendationCardComponent } from "../shared/recommendations/recommendation-card";
import { LibraryApi } from "../../services/library-api";
import { UserBook } from "../../models/library.model";

@Component({
    selector: "app-home",
    imports: [CommonModule, RouterModule, PopularBooksSectionComponent, RecommendationCardComponent],
    templateUrl: './home.html',
    styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  recentRecommendations: Recommendation[] = [];
  isLoadingRecommendations: boolean = false;
  isLoadingLibrary: boolean = false;
  userBooksMap: Map<number, UserBook> = new Map();
  readonly MAX_HOME_RECOMMENDATIONS = 3;

  constructor(
    private authStore: AuthStore,
    private socialApi: SocialApi,
    private libraryApi: LibraryApi
  ) {
    this.isAuthenticated$ = this.authStore.isAuthenticated$;
    this.currentUser$ = this.authStore.currentUser$;
  }

  ngOnInit(): void {
    this.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.loadLibrarySnapshot();
        this.loadRecentRecommendations();
      } else {
        this.recentRecommendations = [];
        this.userBooksMap.clear();
      }
    });
  }

  loadRecentRecommendations(): void {
    this.isLoadingRecommendations = true;
    this.socialApi.getRecommendations().subscribe({
      next: (recommendations) => {
        this.recentRecommendations = recommendations;
        this.isLoadingRecommendations = false;
        this.syncRecommendationReadState();
      },
      error: (error) => {
        console.error("Error loading recommendations:", error);
        this.isLoadingRecommendations = false;
      },
    });
  }

  loadLibrarySnapshot(): void {
    this.isLoadingLibrary = true;
    this.libraryApi.getLibrary().subscribe({
      next: (entries) => {
        this.userBooksMap.clear();
        entries.forEach((entry) => this.userBooksMap.set(entry.book.id, entry));
        this.isLoadingLibrary = false;
        this.syncRecommendationReadState();
      },
      error: (error) => {
        console.error("Error loading library snapshot:", error);
        this.isLoadingLibrary = false;
      },
    });
  }

  markAsRead(recommendationId: number): void {
    const recommendation = this.recentRecommendations.find(
      (r) => r.id === recommendationId
    );
    if (!recommendation) {
      return;
    }

    this.socialApi.markRecommendationAsRead(recommendationId).subscribe({
      next: () => {
        recommendation.isRead = true;
        this.syncRecommendationReadState();
      },
      error: (error) => {
        console.error("Error marking recommendation as read:", error);
      },
    });

    this.ensureBookRecordedAsRead(recommendation.book.id);
  }

  addRecommendationToLibrary(bookId: number): void {
    if (this.userBooksMap.has(bookId)) {
      return;
    }
    this.libraryApi.addBookToLibrary({ bookId, status: "to_read" }).subscribe({
      next: (userBook) => {
        this.userBooksMap.set(userBook.book.id, userBook);
      },
      error: (error) => {
        console.error("Error adding recommended book to library:", error);
      },
    });
  }

  getUserBook(bookId: number): UserBook | undefined {
    return this.userBooksMap.get(bookId);
  }

  get homeRecommendations(): Recommendation[] {
    return this.recentRecommendations.slice(0, this.MAX_HOME_RECOMMENDATIONS);
  }

  private ensureBookRecordedAsRead(bookId: number): void {
    const existing = this.userBooksMap.get(bookId);
    if (existing) {
      if (existing.status === "read") {
        return;
      }
      this.libraryApi.updateBookStatus(existing.id, { status: "read" }).subscribe({
        next: (updated) => {
          this.userBooksMap.set(bookId, updated);
          this.syncRecommendationReadState();
        },
        error: (error) => {
          console.error("Error updating library entry to read:", error);
        },
      });
    } else {
      this.libraryApi.addBookToLibrary({ bookId, status: "read" }).subscribe({
        next: (entry) => {
          this.userBooksMap.set(bookId, entry);
          this.syncRecommendationReadState();
        },
        error: (error) => {
          console.error("Error adding recommended book as read:", error);
        },
      });
    }
  }

  dismissRecommendation(recommendationId: number): void {
    const recommendation = this.recentRecommendations.find(
      (r) => r.id === recommendationId
    );
    if (!recommendation) {
      return;
    }

    this.socialApi.deleteRecommendation(recommendationId).subscribe({
      next: () => {
        this.removeRecommendationLocally(recommendationId);
      },
      error: (error) => {
        console.error("Error dismissing recommendation:", error);
        this.removeRecommendationLocally(recommendationId);
      },
    });
  }

  private removeRecommendationLocally(recommendationId: number): void {
    this.recentRecommendations = this.recentRecommendations.filter(
      (item) => item.id !== recommendationId
    );
    this.syncRecommendationReadState();
  }

  private syncRecommendationReadState(): void {
    if (!this.recentRecommendations.length) {
      return;
    }

    const updated = this.recentRecommendations.map((recommendation) => {
      const userBook = this.userBooksMap.get(recommendation.book.id);
      if (userBook?.status === "read" || recommendation.isRead) {
        return { ...recommendation, isRead: true };
      }
      return recommendation;
    });

    this.recentRecommendations = updated;
  }
}
