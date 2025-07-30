import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SocialService } from '../../../services/social.service';
import { BookService } from '../../../services/book.service';
import { LibraryService } from '../../../services/library.service';
import { Recommendation, Friendship, SendRecommendationRequest } from '../../../models/social.model';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {
  receivedRecommendations: Recommendation[] = [];
  sentRecommendations: Recommendation[] = [];
  friends: Friendship[] = [];
  books: Book[] = [];
  
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

  constructor(
    private socialService: SocialService,
    private bookService: BookService,
    private libraryService: LibraryService
  ) {}

  ngOnInit(): void {
    this.loadRecommendations();
    this.loadFriends();
    this.loadUserBooks();
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.error = '';
    
    // Load received recommendations
    this.socialService.getRecommendations().subscribe({
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
    this.socialService.getSentRecommendations().subscribe({
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
    this.socialService.getFriends().subscribe({
      next: (friends) => {
        this.friends = friends;
      },
      error: (error) => {
        console.error('Error loading friends:', error);
      }
    });
  }

  loadUserBooks(): void {
    this.libraryService.getLibrary().subscribe({
      next: (userBooks) => {
        this.books = userBooks.map(ub => ub.book);
        this.filteredBooks = [...this.books];
      },
      error: (error) => {
        console.error('Error loading user books:', error);
      }
    });
  }

  setActiveTab(tab: 'received' | 'sent' | 'send'): void {
    this.activeTab = tab;
  }

  markAsRead(recommendationId: number): void {
    this.socialService.markRecommendationAsRead(recommendationId).subscribe({
      next: () => {
        const recommendation = this.receivedRecommendations.find(r => r.id === recommendationId);
        if (recommendation) {
          recommendation.isRead = true;
        }
      },
      error: (error) => {
        console.error('Error marking recommendation as read:', error);
      }
    });
  }

  deleteRecommendation(recommendationId: number, type: 'received' | 'sent'): void {
    if (confirm('Are you sure you want to delete this recommendation?')) {
      this.socialService.deleteRecommendation(recommendationId).subscribe({
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

    this.socialService.sendRecommendation(request).subscribe({
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
    this.libraryService.addBookToLibrary({
      bookId: book.id,
      status: 'to_read'
    }).subscribe({
      next: () => {
        // Show success message or update UI
        console.log('Book added to library successfully');
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