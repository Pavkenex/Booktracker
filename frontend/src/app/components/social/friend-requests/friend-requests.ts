import { Component, OnInit } from '@angular/core';

import { SocialService } from '../../../services/social.service';
import { FriendRequest } from '../../../models/social.model';

@Component({
    selector: 'app-friend-requests',
    imports: [],
    templateUrl: './friend-requests.component.html',
    styleUrls: ['./friend-requests.component.css']
})
export class FriendRequestsComponent implements OnInit {
  friendRequests: FriendRequest[] = [];
  isLoading: boolean = false;
  error: string = '';
  processingRequests: Set<number> = new Set();

  constructor(private socialService: SocialService) {}

  ngOnInit(): void {
    this.loadFriendRequests();
    
    // Force refresh notifications when component loads
    this.socialService.forceRefreshNotifications();
  }

  loadFriendRequests(): void {
    this.isLoading = true;
    this.error = '';
    
    this.socialService.getFriendRequests().subscribe({
      next: (requests) => {
        this.friendRequests = requests.filter(req => req.status === 'pending');
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load friend requests. Please try again.';
        this.isLoading = false;
        console.error('Error loading friend requests:', error);
      }
    });
  }

  acceptFriendRequest(requestId: number): void {
    this.processingRequests.add(requestId);
    
    this.socialService.respondToFriendRequest({ requestId, accept: true }).subscribe({
      next: () => {
        this.friendRequests = this.friendRequests.filter(req => req.id !== requestId);
        this.processingRequests.delete(requestId);
        this.socialService.refreshNotifications();
      },
      error: (error) => {
        console.error('Error accepting friend request:', error);
        this.error = 'Failed to accept friend request. Please try again.';
        this.processingRequests.delete(requestId);
      }
    });
  }

  declineFriendRequest(requestId: number): void {
    this.processingRequests.add(requestId);
    
    this.socialService.respondToFriendRequest({ requestId, accept: false }).subscribe({
      next: () => {
        this.friendRequests = this.friendRequests.filter(req => req.id !== requestId);
        this.processingRequests.delete(requestId);
        this.socialService.refreshNotifications();
      },
      error: (error) => {
        console.error('Error declining friend request:', error);
        this.error = 'Failed to decline friend request. Please try again.';
        this.processingRequests.delete(requestId);
      }
    });
  }

  isProcessing(requestId: number): boolean {
    return this.processingRequests.has(requestId);
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
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}