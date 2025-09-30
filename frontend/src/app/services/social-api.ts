import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiClient } from './api-client';
import { AuthStore } from './auth-store';
import {
  Friendship,
  FriendRequest,
  Recommendation,
  SendFriendRequestRequest,
  RespondToFriendRequestRequest,
  SendRecommendationRequest,
  FriendSearchResult,
  NotificationCount,
  User
} from '../models/social.model';

@Injectable({
  providedIn: 'root'
})
export class SocialApi {
  private notificationCountSubject = new BehaviorSubject<NotificationCount>({
    friendRequests: 0,
    recommendations: 0,
    total: 0
  });
  
  public notificationCount$ = this.notificationCountSubject.asObservable();
  private notificationInterval: any;

  constructor(private apiClient: ApiClient, private authStore: AuthStore) {
    // Subscribe to authentication changes and start/stop polling accordingly
    this.authStore.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.loadNotificationCount();
        this.startNotificationPolling();
      } else {
        this.stopNotificationPolling();
        // Reset notification count when user logs out
        this.notificationCountSubject.next({
          friendRequests: 0,
          recommendations: 0,
          total: 0
        });
      }
    });
  }

  // Friends Management
  getFriends(): Observable<Friendship[]> {
    return this.apiClient.get<Friendship[]>('/friends');
  }

  sendFriendRequest(request: SendFriendRequestRequest): Observable<any> {
    return this.apiClient.post('/friends/request', request)
      .pipe(tap(() => this.loadNotificationCount()));
  }

  getFriendRequests(): Observable<FriendRequest[]> {
    return this.apiClient.get<FriendRequest[]>('/friends/requests');
  }

  respondToFriendRequest(request: RespondToFriendRequestRequest): Observable<any> {
    return this.apiClient.put(`/friends/request/${request.requestId}`, { accept: request.accept })
      .pipe(tap(() => this.loadNotificationCount()));
  }

  removeFriend(friendId: number): Observable<any> {
    return this.apiClient.delete(`/friends/${friendId}`);
  }

  searchUsers(query: string): Observable<FriendSearchResult[]> {
    return this.apiClient.get<FriendSearchResult[]>(`/friends/search?q=${encodeURIComponent(query)}`);
  }

  // Recommendations
  getRecommendations(): Observable<Recommendation[]> {
    return this.apiClient.get<Recommendation[]>('/recommendations/received');
  }

  getSentRecommendations(): Observable<Recommendation[]> {
    return this.apiClient.get<Recommendation[]>('/recommendations/sent');
  }

  sendRecommendation(request: SendRecommendationRequest): Observable<any> {
    return this.apiClient.post('/recommendations', request)
      .pipe(tap(() => this.loadNotificationCount()));
  }

  markRecommendationAsRead(recommendationId: number): Observable<any> {
    return this.apiClient.put(`/recommendations/${recommendationId}/read`, {})
      .pipe(tap(() => this.loadNotificationCount()));
  }

  deleteRecommendation(recommendationId: number): Observable<any> {
    return this.apiClient.delete(`/recommendations/${recommendationId}`)
      .pipe(tap(() => this.loadNotificationCount()));
  }

  // Notifications
  getNotificationCount(): Observable<NotificationCount> {
    return this.apiClient.get<NotificationCount>('/friends/notifications/count');
  }
  
  markAllRecommendationsAsRead(): Observable<any> {
    return this.apiClient.post('/friends/notifications/recommendations/mark-all-read', {})
      .pipe(tap(() => this.loadNotificationCount()));
  }

  private loadNotificationCount(): void {
    // Only load notifications if user is authenticated
    if (!this.authStore.isAuthenticated()) {
      return;
    }
    
    this.getNotificationCount().subscribe({
      next: (count) => {
        this.notificationCountSubject.next(count);
      },
      error: (error) => {
        // If we get a 403, user is likely not authenticated - stop polling
        if (error.status === 403) {
          this.stopNotificationPolling();
        }
        console.error('Error loading notification count:', error);
      }
    });
  }

  refreshNotifications(): void {
    this.loadNotificationCount();
  }

  private startNotificationPolling(): void {
    // Poll for notifications every 30 seconds
    this.notificationInterval = setInterval(() => {
      this.loadNotificationCount();
    }, 30000);
  }

  stopNotificationPolling(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  // Call this when user logs out
  onDestroy(): void {
    this.stopNotificationPolling();
  }

  // Force immediate refresh - useful when user is actively using social features
  forceRefreshNotifications(): void {
    this.loadNotificationCount();
  }

  // Start more frequent polling when user is on social pages
  startFrequentPolling(): void {
    this.stopNotificationPolling();
    this.notificationInterval = setInterval(() => {
      this.loadNotificationCount();
    }, 10000); // Every 10 seconds
  }

  // Resume normal polling
  resumeNormalPolling(): void {
    this.stopNotificationPolling();
    this.startNotificationPolling();
  }
}
