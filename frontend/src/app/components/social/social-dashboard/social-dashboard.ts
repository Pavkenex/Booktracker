import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  isSidebarOpen = true;
  isMobileView = false;

  constructor(private socialApi: SocialApi) {}

  ngOnInit(): void {
    this.socialApi.notificationCount$.subscribe(count => {
      this.notificationCount = count;
    });

    this.socialApi.startFrequentPolling();
    this.socialApi.forceRefreshNotifications();
    this.syncSidebarWithViewport();
  }

  ngOnDestroy(): void {
    this.socialApi.resumeNormalPolling();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.syncSidebarWithViewport();
  }

  setSidebarTab(tab: 'friends' | 'requests'): void {
    this.sidebarTab = tab;
    if (tab === 'requests') {
      this.socialApi.forceRefreshNotifications();
    }
  }

  toggleSidebar(): void {
    if (this.isMobileView) {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  }

  closeSidebar(): void {
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    }
  }

  private syncSidebarWithViewport(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const wasMobile = this.isMobileView;
    this.isMobileView = window.innerWidth < 768;
    if (!this.isMobileView) {
      this.isSidebarOpen = true;
    } else if (!wasMobile) {
      this.isSidebarOpen = false;
    }
  }
}
