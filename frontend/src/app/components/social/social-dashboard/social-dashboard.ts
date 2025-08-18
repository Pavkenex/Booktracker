import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FriendsListComponent } from '../friends-list/friends-list';
import { FriendRequestsComponent } from '../friend-requests/friend-requests';
import { RecommendationsComponent } from '../recommendations/recommendations';
import { SocialApi } from '../../../services/social-api';
import { NotificationCount } from '../../../models/social.model';

@Component({
    selector: 'app-social-dashboard',
    imports: [
    RouterModule,
    FriendsListComponent,
    FriendRequestsComponent,
    RecommendationsComponent
],
    templateUrl: './social-dashboard.html',
    styleUrls: ['./social-dashboard.css']
})
export class SocialDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'friends' | 'requests' | 'recommendations' = 'friends';
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
    
    // Start frequent polling when user is on social dashboard
    this.socialApi.startFrequentPolling();
    
    // Force immediate refresh
    this.socialApi.forceRefreshNotifications();
  }

  ngOnDestroy(): void {
    // Resume normal polling when leaving social dashboard
    this.socialApi.resumeNormalPolling();
  }

  setActiveTab(tab: 'friends' | 'requests' | 'recommendations'): void {
    this.activeTab = tab;
    
    // Force refresh when switching tabs
    this.socialApi.forceRefreshNotifications();
  }
}
