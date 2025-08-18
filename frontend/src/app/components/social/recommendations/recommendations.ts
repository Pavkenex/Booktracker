import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { SocialApi } from '../../../services/social-api';
import { BookApi } from '../../../services/book-api';
import { LibraryApi } from '../../../services/library-api';
import { ActivatedRoute } from '@angular/router';
import { Recommendation, Friendship, SendRecommendationRequest } from '../../../models/social.model';
import { Book } from '../../../models/book.model';
import { UserBook } from '../../../models/library.model';

@Component({
    selector: 'app-recommendations',
    imports: [FormsModule],
    templateUrl: './recommendations.html',
    styleUrls: ['./recommendations.css']
})
export class RecommendationsComponent implements OnInit {
  receivedRecommendations: Recommendation[] = [];
  sentRecommendations: Recommendation[] = [];
  friends: Friendship[] = [];
  books: Book[] = [];
  userBooksMap: Map<number, UserBook> = new Map();
  
  isLoading: boolean = false;
  error: string = '';
  activeTab: 'received' | 'sent' | 'send' = 'received';
  
  // Send recommendation form
  selectedFriendId: number | null = null;
  selectedBookId: number | null = null;
  recommendationMessage: string = '';
  bookSearchQuery: string = '';
  filteredBooks: Book[] = [];
  isSending: boolean = false;
  // Query param handling
  private pendingBookId: number | null = null;
  private pendingAction: 'send' | null = null;

  constructor(
    private socialApi: SocialApi,
    private bookApi: BookApi,
    private libraryApi: LibraryApi,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read query params for preselecting a book and switching to send tab
    this.route.queryParams.subscribe(params => {
      const action = params['action'];
      const bookIdParam = params['bookId'];
      if (action === 'send') {
        this.pendingAction = 'send';
        this.activeTab = 'send';
      }
      const parsedId = Number(bookIdParam);
      if (!isNaN(parsedId) && parsedId > 0) {
        this.pendingBookId = parsedId;
      }
      // If books already loaded we can try selecting immediately
      if (this.books.length > 0 && this.pendingBookId) {
        this.applyPendingBookSelection();
      }
    });

    this.loadRecommendations();
    this.loadFriends();
    this.loadUserBooks();
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.error = '';
    
    // Load received recommendations
    this.socialApi.getRecommendations().subscribe({
      next: (recommendations) => {
        this.receivedRecommendations = recommendations;
        this.loadSentRecommendations();
      },
      error: (error) => {
        this.error = 'Failed to load recommendations. Please try again.';
        this.isLoading = false;
        console.error('Error loading recommendations:', error);
      }
    });
  }

  loadSentRecommendations(): void {
    this.socialApi.getSentRecommendations().subscribe({
      next: (recommendations) => {
        this.sentRecommendations = recommendations;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sent recommendations:', error);
        this.isLoading = false;
      }
    });
  }

  loadFriends(): void {
    this.socialApi.getFriends().subscribe({
      next: (friends) => {
        this.friends = friends;
      },
      error: (error) => {
        console.error('Error loading friends:', error);
      }
    });
  }

  loadUserBooks(): void {
    this.libraryApi.getLibrary().subscribe({
      next: (userBooks) => {
        this.books = userBooks.map(ub => {
          this.userBooksMap.set(ub.book.id, ub);
          return ub.book;
        });
        this.filteredBooks = [...this.books];
        // Apply pending book selection if present
        if (this.pendingBookId) {
          this.applyPendingBookSelection();
        }
      },
      error: (error) => {
        console.error('Error loading user books:', error);
      }
    });
  }

  // Ownership helpers
  hasBook(book: Book): boolean { return this.userBooksMap.has(book.id); }
  getUserBook(book: Book): UserBook | undefined { return this.userBooksMap.get(book.id); }
  hasStatus(book: Book, status: UserBook['status']): boolean {
    const ub = this.getUserBook(book); return !!ub && ub.status === status;
  }

  markAsReadDirect(book: Book): void {
    const ub = this.getUserBook(book);
    if (!ub || ub.status === 'read') return;
    this.libraryApi.updateBookStatus(ub.id, { status: 'read' }).subscribe({
      next: updated => { this.userBooksMap.set(book.id, { ...ub, ...updated }); },
      error: err => console.error('Failed to mark as read', err)
    });
  }

  startReading(book: Book): void {
    const ub = this.getUserBook(book);
    if (!ub || ub.status === 'currently_reading') return;
    this.libraryApi.updateBookStatus(ub.id, { status: 'currently_reading' }).subscribe({
      next: updated => { this.userBooksMap.set(book.id, { ...ub, ...updated }); },
      error: err => console.error('Failed to set currently reading', err)
    });
  }

  addToLibraryQuick(book: Book): void {
    if (this.hasBook(book)) return;
    this.libraryApi.addBookToLibrary({ bookId: book.id, status: 'to_read' }).subscribe({
      next: ub => { this.userBooksMap.set(book.id, { ...ub }); },
      error: err => console.error('Failed quick add', err)
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
      // Clear pending once applied
      this.pendingBookId = null;
      this.pendingAction = null;
    } else {
      // If not in library fetch directly and add temporarily
      this.bookApi.getBookById(this.pendingBookId).subscribe({
        next: fetched => {
          this.books.push(fetched);
          this.filteredBooks = [...this.books];
          this.selectBook(fetched);
          if (this.pendingAction === 'send') this.activeTab = 'send';
          this.pendingBookId = null;
          this.pendingAction = null;
        },
        error: err => {
          console.warn('Could not preselect book for recommendation', err);
        }
      });
    }
  }

  setActiveTab(tab: 'received' | 'sent' | 'send'): void {
    this.activeTab = tab;
  }

  deleteRecommendation(recommendationId: number, type: 'received' | 'sent'): void {
    if (confirm('Are you sure you want to delete this recommendation?')) {
      this.socialApi.deleteRecommendation(recommendationId).subscribe({
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
    this.bookSearchQuery = book.title;
    this.filteredBooks = [];
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

    this.socialApi.sendRecommendation(request).subscribe({
      next: () => {
        // Reset form
        this.selectedFriendId = null;
        this.selectedBookId = null;
        this.recommendationMessage = '';
        this.bookSearchQuery = '';
        this.filteredBooks = [...this.books];
        
        // Reload sent recommendations
        this.loadSentRecommendations();
        
        // Switch to sent tab to show the new recommendation
        this.activeTab = 'sent';
        this.isSending = false;
      },
      error: (error) => {
        console.error('Error sending recommendation:', error);
        this.error = 'Failed to send recommendation. Please try again.';
        this.isSending = false;
      }
    });
  }

  addBookToLibrary(book: Book): void {
    if (this.hasBook(book)) return; // safety
    this.libraryApi.addBookToLibrary({ bookId: book.id, status: 'to_read' }).subscribe({
      next: (userBook) => {
        // Update ownership map so button disables
        this.userBooksMap.set(book.id, userBook);
      },
      error: (error) => {
        console.error('Error adding book to library:', error);
        this.error = 'Failed to add book to library. It may already be in your library.';
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
