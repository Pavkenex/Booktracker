import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Recommendation } from '../../../models/social.model';

@Component({
    selector: 'app-home-recommendations',
    imports: [CommonModule, RouterModule],
    templateUrl: './home-recommendations.html',
    styleUrls: ['./home-recommendations.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeRecommendationsComponent {
  @Input() recommendations: Recommendation[] = [];
  @Input() loading = false;
  @Output() markAsRead = new EventEmitter<number>();

  trackByRecommendation(_: number, recommendation: Recommendation): number {
    return recommendation.id;
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString();
  }
}
