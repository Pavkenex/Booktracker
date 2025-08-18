import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthService, User } from "../../services/auth.service";
import { SocialService } from "../../services/social.service";
import { Recommendation } from "../../models/social.model";
import { Observable } from "rxjs";
import { PopularBooksSectionComponent } from '../shared/popular-books-section/popular-books-section';

@Component({
    selector: "app-home",
    imports: [CommonModule, RouterModule, PopularBooksSectionComponent],
    template: `
    <div class="row">
      <div class="col-12">
        <div class="jumbotron bg-light p-5 rounded">
          <h1 class="display-4">
            @if (!(isAuthenticated$ | async)) {
              <span
                >Welcome to BookTracker</span
                >
              }
              @if (isAuthenticated$ | async) {
                <span
                  >Welcome back, {{ (currentUser$ | async)?.username }}!</span
                  >
                }
              </h1>
              <p class="lead">
                Track your reading progress, discover new books, and connect with
                fellow readers.
              </p>
              <hr class="my-4" />
              @if (!(isAuthenticated$ | async)) {
                <p>
                  Get started by creating an account or browsing our book catalog.
                </p>
              }
              @if (isAuthenticated$ | async) {
                <p>
                  Continue managing your personal library or discover new books.
                </p>
              }
              <div class="d-flex gap-2">
                @if (!(isAuthenticated$ | async)) {
                  <a routerLink="/register" class="btn btn-primary btn-lg"
                    >Get Started</a
                    >
                    <a routerLink="/books" class="btn btn-outline-secondary btn-lg"
                      >Browse Books</a
                      >
                    } @else {
                      <a routerLink="/library" class="btn btn-primary btn-lg"
                        >My Library</a
                        >
                        <a routerLink="/books" class="btn btn-outline-secondary btn-lg"
                          >Browse Books</a
                          >
                        }
                      </div>
                    </div>
                  </div>
                </div>
    
                <!-- Popular Books Section -->
                <div class="row mt-5">
                  <div class="col-12">
                    <app-popular-books-section></app-popular-books-section>
                  </div>
                </div>
    
                <!-- Recent Recommendations Section (only for authenticated users) -->
                @if (isAuthenticated$ | async) {
                  <div class="row mt-5">
                    <div class="col-12">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <h3>Recent Book Recommendations</h3>
                        <a
                          routerLink="/social/recommendations"
                          class="btn btn-outline-primary btn-sm"
                          >View All</a
                          >
                        </div>
                        @if (isLoadingRecommendations) {
                          <div class="text-center py-4">
                            <div class="spinner-border" role="status">
                              <span class="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        }
                        @if (
                          !isLoadingRecommendations && recentRecommendations.length === 0
                          ) {
                          <div
                            class="text-center py-4"
                            >
                            <i class="fas fa-book fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No recommendations yet</h5>
                            <p class="text-muted">
                              Connect with friends to start receiving book recommendations!
                            </p>
                            <a routerLink="/social" class="btn btn-primary">Go to Social</a>
                          </div>
                        }
                        @if (!isLoadingRecommendations && recentRecommendations.length > 0) {
                          <div
                            class="row"
                            >
                            @for (recommendation of recentRecommendations; track recommendation) {
                              <div
                                class="col-md-4 mb-3"
                                >
                                <div
                                  class="card h-100 recommendation-card"
                                  [class.unread]="!recommendation.isRead"
                                  >
                                  <div class="card-body">
                                    <div
                                      class="d-flex justify-content-between align-items-start mb-2"
                                      >
                                      <small class="text-muted">{{
                                        getTimeAgo(recommendation.createdAt)
                                      }}</small>
                                      @if (!recommendation.isRead) {
                                        <span class="badge bg-primary"
                                          >New</span
                                          >
                                        }
                                      </div>
                                      <h6 class="card-title">{{ recommendation.book.title }}</h6>
                                      <p class="card-text">
                                        <small class="text-muted"
                                          >by {{ recommendation.book.author }}</small
                                          >
                                        </p>
                                        @if (recommendation.message) {
                                          <p class="card-text">
                                            <em>"{{ recommendation.message }}"</em>
                                          </p>
                                        }
                                        <div
                                          class="d-flex justify-content-between align-items-center mt-3"
                                          >
                                          <small class="text-muted">
                                            From: <strong>{{ recommendation.sender.username }}</strong>
                                          </small>
                                          <div class="btn-group btn-group-sm">
                                            @if (!recommendation.isRead) {
                                              <button
                                                class="btn btn-outline-primary btn-sm"
                                                (click)="markAsRead(recommendation.id)"
                                                title="Mark as read"
                                                >
                                                <i class="fas fa-check"></i>
                                              </button>
                                            }
                                            <a
                                              [routerLink]="['/books', recommendation.book.id]"
                                              class="btn btn-primary btn-sm"
                                              title="View book"
                                              >
                                              <i class="fas fa-eye"></i>
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      }
    
                      <div class="row mt-5">
                        <div class="col-md-4">
                          <div class="card h-100">
                            <div class="card-body">
                              <h5 class="card-title">Track Your Reading</h5>
                              <p class="card-text">
                                Keep track of books you want to read, are currently reading, and
                                have completed.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="card h-100">
                            <div class="card-body">
                              <h5 class="card-title">Discover Books</h5>
                              <p class="card-text">
                                Browse our extensive catalog and discover your next favorite book.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="card h-100">
                            <div class="card-body">
                              <h5 class="card-title">Connect with Friends</h5>
                              <p class="card-text">
                                Share recommendations and discuss books with your friends.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
    `,
    styles: [
        `
      .jumbotron {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .card {
        transition: transform 0.2s;
      }

      .card:hover {
        transform: translateY(-5px);
      }

      .recommendation-card.unread {
        border-left: 4px solid #007bff;
        box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
      }

      .recommendation-card .card-title {
        color: #333;
        font-weight: 600;
      }

      .btn-group-sm .btn {
        padding: 0.25rem 0.5rem;
      }
    `,
    ]
})
export class HomeComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  recentRecommendations: Recommendation[] = [];
  isLoadingRecommendations: boolean = false;

  constructor(
    private authService: AuthService,
    private socialService: SocialService
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.loadRecentRecommendations();
      }
    });
  }

  loadRecentRecommendations(): void {
    this.isLoadingRecommendations = true;
    this.socialService.getRecommendations().subscribe({
      next: (recommendations) => {
        this.recentRecommendations = recommendations.slice(0, 3); // Show only 3 most recent
        this.isLoadingRecommendations = false;
      },
      error: (error) => {
        console.error("Error loading recommendations:", error);
        this.isLoadingRecommendations = false;
      },
    });
  }

  markAsRead(recommendationId: number): void {
    this.socialService.markRecommendationAsRead(recommendationId).subscribe({
      next: () => {
        const recommendation = this.recentRecommendations.find(
          (r) => r.id === recommendationId
        );
        if (recommendation) {
          recommendation.isRead = true;
        }
      },
      error: (error) => {
        console.error("Error marking recommendation as read:", error);
      },
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
