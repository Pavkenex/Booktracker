import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
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
export class SocialService {
  private notificationCountSubject = new BehaviorSubject<NotificationCount>({
    friendRequests: 0,
    recommendations: 0,
    total: 0
  });
  
  public notificationCount$ = this.notificationCountSubject.asObservable();
  private notificationInterval: any;

  constructor(private apiService: ApiService) {
    this.loadNotificationCount();
    this.startNotificationPolling();
  }

  // Friends Management
  getFriends(): Observable<Friendship[]> {
    return this.apiService.get<Friendship[]>('/friends');
  }

  sendFriendRequest(request: SendFriendRequestRequest): Observable<any> {
    return this.apiService.post('/friends/request', request)
      .pipe(tap(() => this.loadNotificationCount()));
  }

  getFriendRequests(): Observable<FriendRequest[]> {
    return this.apiService.get<FriendRequest[]>('/friends/requests');
  }

  respondToFriendRequest(request: RespondToFriendRequestRequest): Observable<any> {
    return this.apiService.put(`/friends/request/${request.requestId}`, { accept: request.accept })
      .pipe(tap(() => this.loadNotificationCount()));
  }

  removeFriend(friendId: number): Observable<any> {
    return this.apiService.delete(`/friends/${friendId}`);
  }

  searchUsers(query: string): Observable<FriendSearchResult[]> {
    return this.apiService.get<FriendSearchResult[]>(`/friends/search?q=${encodeURIComponent(query)}`);
  }

  // Recommendations
  getRecommendations(): Observable<Recommendation[]> {
    return this.apiService.get<Recommendation[]>('/recommendations/received');
  }

  getSentRecommendations(): Observable<Recommendation[]> {
    return this.apiService.get<Recommendation[]>('/recommendations/sent');
  }

  sendRecommendation(request: SendRecommendationRequest): Observable<any> {
    return this.apiService.post('/recommendations', request)
      .pipe(tap(() => this.loadNotificationCount()));
  }

  markRecommendationAsRead(recommendationId: number): Observable<any> {
    return this.apiService.put(`/recommendations/${recommendationId}/read`, {})
      .pipe(tap(() => this.loadNotificationCount()));
  }

  deleteRecommendation(recommendationId: number): Observable<any> {
    return this.apiService.delete(`/recommendations/${recommendationId}`)
      .pipe(tap(() => this.loadNotificationCount()));
  }

  // Notifications
  getNotificationCount(): Observable<NotificationCount> {
    return this.apiService.get<NotificationCount>('/notifications/count');
  }

  private loadNotificationCount(): void {
    this.getNotificationCount().subscribe({
      next: (count) => {
        console.log('Notification count updated:', count);
        this.notificationCountSubject.next(count);
      },
      error: (error) => console.error('Error loading notification count:', error)
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