import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SocialApi } from '../../../services/social-api';
import { Friendship, FriendSearchResult } from '../../../models/social.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FallbackImageDirective } from '../../../directives/fallback-image';
import { ClickOutsideDirective } from '../../../directives/click-outside';
import { APP_CONSTANTS } from '../../../constants/app.constants';

@Component({
    selector: 'app-friends-list',
    imports: [FormsModule, FallbackImageDirective, ClickOutsideDirective],
    templateUrl: './friends-list.html',
    styleUrls: ['./friends-list.css']
})
export class FriendsListComponent implements OnInit, OnDestroy {
  @Output() closeSidebarRequested = new EventEmitter<void>();
  friends: Friendship[] = [];
  searchResults: FriendSearchResult[] = [];
  searchQuery: string = '';
  isLoading: boolean = false;
  isSearching: boolean = false;
  error: string = '';
  showSearch: boolean = false;
  openMenuFriendId: number | null = null;

  readonly defaultAvatar = APP_CONSTANTS.DEFAULT_AVATAR_PLACEHOLDER;
  private searchSubject = new Subject<string>();

  constructor(
    private socialApi: SocialApi,
    private router: Router,
    private route: ActivatedRoute
  ) {
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

    this.socialApi.getFriends().subscribe({
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
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.performSearch(this.searchQuery);
  }

  private performSearch(query: string): void {
    this.isSearching = true;
    this.socialApi.searchUsers(query).subscribe({
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
    this.socialApi.sendFriendRequest({ friendId: userId }).subscribe({
      next: () => {
        const user = this.searchResults.find(u => u.id === userId);
        if (user) {
          user.hasPendingRequest = true;
        }
        this.socialApi.refreshNotifications();
      },
      error: (error) => {
        console.error('Error sending friend request:', error);
        this.error = 'Failed to send friend request. Please try again.';
      }
    });
  }

  removeFriend(friendId: number): void {
    if (confirm('Are you sure you want to remove this friend?')) {
      this.socialApi.removeFriend(friendId).subscribe({
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
    this.router.navigate(['/library/user', friendship.friendId, friendship.friend?.username || 'User']);
  }

  recommendBook(friendship: Friendship): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: 'send', friendId: friendship.friendId },
      queryParamsHandling: 'merge'
    });
    this.closeMenu();
    this.closeSidebarRequested.emit();
  }

  getFriendAvatar(friendship: Friendship): string {
    return friendship.friend?.avatarUrl || this.defaultAvatar;
  }

  toggleMenu(friendship: Friendship): void {
    this.openMenuFriendId = this.openMenuFriendId === friendship.friendId ? null : friendship.friendId;
  }

  closeMenu(): void {
    this.openMenuFriendId = null;
  }

  onMenuOutside(friendId: number): void {
    if (this.openMenuFriendId === friendId) {
      this.closeMenu();
    }
  }
}
