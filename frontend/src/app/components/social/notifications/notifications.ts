import { Component, OnInit, OnDestroy } from '@angular/core';

import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SocialApi } from '../../../services/social-api';
import { NotificationCount } from '../../../models/social.model';
import { ClickOutsideDirective } from '../../../directives/click-outside';

@Component({
    selector: 'app-notifications',
    imports: [RouterModule, ClickOutsideDirective],
    templateUrl: './notifications.html',
    styleUrls: ['./notifications.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notificationCount: NotificationCount = {
    friendRequests: 0,
    recommendations: 0,
    total: 0
  };
  acknowledgedTotal: number = 0;
  unseenTotal: number = 0;
  
  showDropdown: boolean = false;
  isRefreshing: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private socialApi: SocialApi,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.socialApi.notificationCount$.subscribe(count => {
        this.notificationCount = count;
        this.isRefreshing = false;

        if (this.showDropdown) {
          this.acknowledgedTotal = count.total;
        } else if (this.acknowledgedTotal > count.total) {
          this.acknowledgedTotal = count.total;
        }

        const delta = count.total - this.acknowledgedTotal;
        this.unseenTotal = delta > 0 ? delta : 0;
      })
    );
    
    this.socialApi.forceRefreshNotifications();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  toggleDropdown(): void {
    const willShow = !this.showDropdown;
    this.showDropdown = willShow;

    if (willShow) {
      this.acknowledgedTotal = this.notificationCount.total;
      this.unseenTotal = 0;
    }
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  refreshNotifications(): void {
    this.isRefreshing = true;
    this.socialApi.forceRefreshNotifications();
    
    setTimeout(() => {
      this.isRefreshing = false;
    }, 2000);
  }

  onRecommendationsClick(): void {
    this.socialApi.markAllRecommendationsAsRead().subscribe({
      next: () => {
        this.closeDropdown();
      },
      error: (err) => {
        console.error('Failed to mark recommendations as read', err);
        this.closeDropdown();
      }
    });
  }

  onFriendRequestsClick(): void {
    this.router.navigate(['/social'], { queryParams: { tab: 'requests' } });
    this.closeDropdown();
  }
}
