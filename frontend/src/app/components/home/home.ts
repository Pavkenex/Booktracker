import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AuthStore, User } from '../../services/auth-store';
import { SocialApi } from '../../services/social-api';
import { Recommendation } from "../../models/social.model";
import { Observable } from "rxjs";
import { PopularBooksSectionComponent } from '../shared/popular-books-section/popular-books-section';

@Component({
    selector: "app-home",
    imports: [CommonModule, RouterModule, PopularBooksSectionComponent],
    templateUrl: './home.html',
    styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<User | null>;
  recentRecommendations: Recommendation[] = [];
  isLoadingRecommendations: boolean = false;

  constructor(
    private authStore: AuthStore,
    private socialApi: SocialApi
  ) {
    this.isAuthenticated$ = this.authStore.isAuthenticated$;
    this.currentUser$ = this.authStore.currentUser$;
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
    this.socialApi.getRecommendations().subscribe({
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
    this.socialApi.markRecommendationAsRead(recommendationId).subscribe({
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
