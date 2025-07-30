import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FriendsListComponent } from '../friends-list/friends-list.component';
import { FriendRequestsComponent } from '../friend-requests/friend-requests.component';
import { RecommendationsComponent } from '../recommendations/recommendations.component';
import { SocialService } from '../../../services/social.service';
import { NotificationCount } from '../../../models/social.model';

@Component({
  selector: 'app-social-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FriendsListComponent,
    FriendRequestsComponent,
    RecommendationsComponent
  ],
  templateUrl: './social-dashboard.component.html',
  styleUrls: ['./social-dashboard.component.css']
})
export class SocialDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'friends' | 'requests' | 'recommendations' = 'friends';
  notificationCount: NotificationCount = {
    friendRequests: 0,
    recommendations: 0,
    total: 0
  };

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
    this.socialService.notificationCount$.subscribe(count => {
      this.notificationCount = count;
    });
    
    // Start frequent polling when user is on social dashboard
    this.socialService.startFrequentPolling();
    
    // Force immediate refresh
    this.socialService.forceRefreshNotifications();
  }

  ngOnDestroy(): void {
    // Resume normal polling when leaving social dashboard
    this.socialService.resumeNormalPolling();
  }

  setActiveTab(tab: 'friends' | 'requests' | 'recommendations'): void {
    this.activeTab = tab;
    
    // Force refresh when switching tabs
    this.socialService.forceRefreshNotifications();
  }
}