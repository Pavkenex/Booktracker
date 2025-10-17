import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { SocialApi } from '../../../services/social-api';
import { BookApi } from '../../../services/book-api';
import { LibraryApi } from '../../../services/library-api';
import { ActivatedRoute } from '@angular/router';
import { Recommendation, Friendship, SendRecommendationRequest } from '../../../models/social.model';
import { Book } from '../../../models/book.model';
import { UserBook } from '../../../models/library.model';
import { RecommendationCardComponent } from '../../shared/recommendations/recommendation-card';
import { ClickOutsideDirective } from '../../../directives/click-outside';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-recommendations',
  imports: [CommonModule, FormsModule, RecommendationCardComponent, ClickOutsideDirective],
    templateUrl: './recommendations.html',
    styleUrls: ['./recommendations.css']
})
export class RecommendationsComponent implements OnInit, OnDestroy {
  receivedRecommendations: Recommendation[] = [];
  sentRecommendations: Recommendation[] = [];
  friends: Friendship[] = [];
  books: Book[] = [];
  userBooksMap: Map<number, UserBook> = new Map();
  
  isLoading: boolean = false;
  error: string = '';
  activeTab: 'received' | 'sent' | 'send' = 'received';
  
  selectedFriendId: number | null = null;
  selectedBookId: number | null = null;
  recommendationMessage: string = '';
  bookSearchQuery: string = '';
  filteredBooks: Book[] = [];
  isSending: boolean = false;
  isBookDropdownOpen = false;
  private pendingBookId: number | null = null;
  private pendingAction: 'send' | null = null;
  private pendingFriendId: number | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private socialApi: SocialApi,
    private bookApi: BookApi,
    private libraryApi: LibraryApi,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
      const action = params['action'];
      const bookIdParam = params['bookId'];
      const friendIdParam = params['friendId'];
      if (action === 'send') {
        this.pendingAction = 'send';
        this.activeTab = 'send';
      }
      const parsedId = Number(bookIdParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.pendingBookId = parsedId;
      }
      const parsedFriendId = Number(friendIdParam);
      if (!isNaN(parsedFriendId) && parsedFriendId > 0) {
        this.pendingFriendId = parsedFriendId;
        this.activeTab = 'send';
      }
      if (this.books.length > 0 && this.pendingBookId) {
        this.applyPendingBookSelection();
      }
      if (this.friends.length > 0 && this.pendingFriendId) {
        this.applyPendingFriendSelection();
      }
    });

    this.loadRecommendations();
    this.loadFriends();
    this.loadUserBooks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRecommendations(options: { showSpinner?: boolean } = {}): void {
    const { showSpinner = true } = options;

    if (showSpinner) {
      this.isLoading = true;
    }
    this.error = '';

    forkJoin({
      received: this.socialApi.getRecommendations(),
      sent: this.socialApi.getSentRecommendations()
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (showSpinner) {
            this.isLoading = false;
          }
        })
      )
      .subscribe({
        next: ({ received, sent }) => {
          this.receivedRecommendations = received;
          this.sentRecommendations = sent;
        },
        error: (error) => {
          console.error('Error loading recommendations:', error);
          this.error = 'Failed to load recommendations. Please try again.';
        }
      });
  }

  loadFriends(): void {
    this.socialApi.getFriends()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (friends) => {
          this.friends = friends;
          this.applyPendingFriendSelection();
        },
        error: (error) => {
          console.error('Error loading friends:', error);
        }
      });
  }

  loadUserBooks(): void {
    this.libraryApi.getLibrary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userBooks) => {
          this.books = userBooks.map(ub => {
            this.userBooksMap.set(ub.book.id, ub);
            return ub.book;
          });
          this.filteredBooks = [...this.books];
          this.applyPendingBookSelection();
        },
        error: (error) => {
          console.error('Error loading user books:', error);
        }
      });
  }

  getUserBook(book: Book): UserBook | undefined { return this.userBooksMap.get(book.id); }

  addRecommendationBookToLibrary(bookId: number): void {
    if (this.userBooksMap.has(bookId)) return;
    this.libraryApi.addBookToLibrary({ bookId, status: 'to_read' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userBook) => {
          this.userBooksMap.set(bookId, userBook);
        },
        error: (error) => {
          console.error('Failed to add recommended book to library', error);
        }
      });
  }

  private applyPendingBookSelection(): void {
    if (!this.pendingBookId) return;
    const book = this.books.find(b => b.id === this.pendingBookId);
    if (book) {
      this.selectBook(book);
      if (this.pendingAction === 'send') {
        this.activeTab = 'send';
      }
      this.pendingBookId = null;
      this.pendingAction = null;
    } else {
      this.bookApi.getBookById(this.pendingBookId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: fetched => {
            this.books.push(fetched);
            this.filteredBooks = [...this.books];
            this.selectBook(fetched);
            if (this.pendingAction === 'send') {
              this.activeTab = 'send';
            }
            this.pendingBookId = null;
            this.pendingAction = null;
          },
          error: err => {
            console.warn('Could not preselect book for recommendation', err);
          }
        });
    }
  }

  private applyPendingFriendSelection(): void {
    if (!this.pendingFriendId) return;
    const friend = this.friends.find(f => f.friendId === this.pendingFriendId);
    if (friend) {
      this.selectedFriendId = friend.friendId;
      this.pendingFriendId = null;
    }
  }

  private resetSendForm(): void {
    this.selectedFriendId = null;
    this.selectedBookId = null;
    this.recommendationMessage = '';
    this.bookSearchQuery = '';
    this.filteredBooks = [...this.books];
    this.closeBookDropdown();
  }

  setActiveTab(tab: 'received' | 'sent' | 'send'): void {
    this.activeTab = tab;
  }

  deleteRecommendation(recommendationId: number, type: 'received' | 'sent'): void {
    if (confirm('Are you sure you want to delete this recommendation?')) {
      this.socialApi.deleteRecommendation(recommendationId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (type === 'received') {
              this.receivedRecommendations = this.receivedRecommendations.filter(r => r.id !== recommendationId);
            } else {
              this.sentRecommendations = this.sentRecommendations.filter(r => r.id !== recommendationId);
            }
          },
          error: (error) => {
            console.error('Error deleting recommendation:', error);
            this.error = 'Failed to delete recommendation. Please try again.';
          }
        });
    }
  }

  filterBooks(): void {
    if (!this.bookSearchQuery.trim()) {
      this.filteredBooks = [...this.books];
    } else {
      const query = this.bookSearchQuery.toLowerCase();
      this.filteredBooks = this.books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
      );
    }
  }

  selectBook(book: Book): void {
    this.selectedBookId = book.id;
    this.bookSearchQuery = '';
    this.filteredBooks = [...this.books];
    this.isBookDropdownOpen = false;
  }

  toggleBookDropdown(): void {
    this.isBookDropdownOpen = !this.isBookDropdownOpen;
    if (this.isBookDropdownOpen) {
      this.filterBooks();
    }
  }

  closeBookDropdown(): void {
    if (this.isBookDropdownOpen) {
      this.isBookDropdownOpen = false;
    }
  }

  trackBookById(_: number, book: Book): number {
    return book.id;
  }

  get selectedBookLabel(): string {
    if (!this.selectedBookId) {
      return 'Choose a book...';
    }
    const book = this.books.find(b => b.id === this.selectedBookId);
    return book ? `${book.title} by ${book.author}` : 'Choose a book...';
  }

  sendRecommendation(): void {
    if (!this.selectedFriendId || !this.selectedBookId) {
      this.error = 'Please select both a friend and a book.';
      return;
    }

    this.isSending = true;
    this.error = '';

    const request: SendRecommendationRequest = {
      receiverId: this.selectedFriendId,
      bookId: this.selectedBookId,
      message: this.recommendationMessage.trim() || undefined
    };

    this.socialApi.sendRecommendation(request)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSending = false))
      )
      .subscribe({
        next: () => {
          this.resetSendForm();
          this.loadRecommendations({ showSpinner: false });
          this.activeTab = 'sent';
        },
        error: (error) => {
          console.error('Error sending recommendation:', error);
          this.error = 'Failed to send recommendation. Please try again.';
        }
      });
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
