import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FriendsListComponent } from '../friends-list/friends-list';
import { FriendRequestsComponent } from '../friend-requests/friend-requests';
import { RecommendationsComponent } from '../recommendations/recommendations';
import { SocialApi } from '../../../services/social-api';
import { NotificationCount } from '../../../models/social.model';

@Component({
    selector: 'app-social-dashboard',
    imports: [
    CommonModule,
    RouterModule,
    FriendsListComponent,
    FriendRequestsComponent,
    RecommendationsComponent
],
    templateUrl: './social-dashboard.html',
    styleUrls: ['./social-dashboard.css']
})
export class SocialDashboardComponent implements OnInit, OnDestroy {
  sidebarTab: 'friends' | 'requests' = 'friends';
  notificationCount: NotificationCount = {
    friendRequests: 0,
    recommendations: 0,
    total: 0
  };

  constructor(private socialApi: SocialApi) {}

  ngOnInit(): void {
    this.socialApi.notificationCount$.subscribe(count => {
      this.notificationCount = count;
    });

    this.socialApi.startFrequentPolling();
    this.socialApi.forceRefreshNotifications();
  }

  ngOnDestroy(): void {
    this.socialApi.resumeNormalPolling();
  }

  setSidebarTab(tab: 'friends' | 'requests'): void {
    this.sidebarTab = tab;
    if (tab === 'requests') {
      this.socialApi.forceRefreshNotifications();
    }
  }
}
