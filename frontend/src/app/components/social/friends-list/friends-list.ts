import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SocialService } from '../../../services/social.service';
import { Friendship, FriendSearchResult } from '../../../models/social.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-friends-list',
    imports: [FormsModule],
    templateUrl: './friends-list.component.html',
    styleUrls: ['./friends-list.component.css']
})
export class FriendsListComponent implements OnInit, OnDestroy {
  friends: Friendship[] = [];
  searchResults: FriendSearchResult[] = [];
  searchQuery: string = '';
  isLoading: boolean = false;
  isSearching: boolean = false;
  error: string = '';
  showSearch: boolean = false;
  
  private searchSubject = new Subject<string>();

  constructor(
    private socialService: SocialService,
    private router: Router
  ) {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      if (searchTerm.length >= 2) {
        this.performSearch(searchTerm);
      } else {
        this.searchResults = [];
      }
    });
  }

  ngOnInit(): void {
    this.loadFriends();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  loadFriends(): void {
    this.isLoading = true;
    this.error = '';
    
    this.socialService.getFriends().subscribe({
      next: (friends) => {
        this.friends = friends;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load friends. Please try again.';
        this.isLoading = false;
        console.error('Error loading friends:', error);
      }
    });
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
      this.searchResults = [];
    }
  }

  searchUsers(): void {
    // This method is now just for the manual search button
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.performSearch(this.searchQuery);
  }

  private performSearch(query: string): void {
    this.isSearching = true;
    this.socialService.searchUsers(query).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching users:', error);
        this.isSearching = false;
      }
    });
  }

  sendFriendRequest(userId: number): void {
    this.socialService.sendFriendRequest({ friendId: userId }).subscribe({
      next: () => {
        // Update the search results to reflect the sent request
        const user = this.searchResults.find(u => u.id === userId);
        if (user) {
          user.hasPendingRequest = true;
        }
        // Refresh notifications for the receiver
        this.socialService.refreshNotifications();
      },
      error: (error) => {
        console.error('Error sending friend request:', error);
        this.error = 'Failed to send friend request. Please try again.';
      }
    });
  }

  removeFriend(friendId: number): void {
    if (confirm('Are you sure you want to remove this friend?')) {
      this.socialService.removeFriend(friendId).subscribe({
        next: () => {
          this.friends = this.friends.filter(f => f.friendId !== friendId);
        },
        error: (error) => {
          console.error('Error removing friend:', error);
          this.error = 'Failed to remove friend. Please try again.';
        }
      });
    }
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  viewUserLibrary(friendship: Friendship): void {
    // Navigate to the user's library page
    this.router.navigate(['/library/user', friendship.friendId, friendship.friend?.username || 'User']);
  }
}