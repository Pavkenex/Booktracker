import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LibraryApi } from '../../../services/library-api';
import { LibraryEvents } from '../../../services/library-events';
import { UserBook } from '../../../models/library.model';
import { ReviewFormComponent } from '../review-form/review-form';
import { LibraryStatsComponent } from '../library-stats/library-stats';
import { LibraryTab, LibraryTabBarComponent, LibraryTabCounts } from '../library-tab-bar/library-tab-bar';
import { LibraryBookGridComponent } from '../library-book-grid/library-book-grid';

@Component({
    selector: 'app-personal-library',
  imports: [CommonModule, RouterModule, ReviewFormComponent, LibraryStatsComponent, LibraryTabBarComponent, LibraryBookGridComponent],
    templateUrl: './personal-library.html',
    styleUrls: ['./personal-library.css']
})
export class PersonalLibraryComponent implements OnInit {
  allBooks: UserBook[] = [];
  loading = true;
  activeTab: LibraryTab = 'all';
  selectedBookForReview: UserBook | null = null;

  constructor(
    private libraryApi: LibraryApi,
    private libraryEvents: LibraryEvents
  ) {}

  ngOnInit(): void {
    this.loadLibrary();
  }

  loadLibrary(): void {
    this.loading = true;
    this.libraryApi.getLibrary().subscribe({
      next: (books) => {
        this.allBooks = books;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading library:', error);
        this.loading = false;
      }
    });
  }

  get filteredBooks(): UserBook[] {
    switch (this.activeTab) {
      case 'to_read':
        return this.booksToRead;
      case 'currently_reading':
        return this.booksCurrentlyReading;
      case 'read':
        return this.booksRead;
      case 'favorites':
        return this.favoriteBooks;
      default:
        return this.allBooks;
    }
  }

  get booksToRead(): UserBook[] {
    return this.allBooks.filter(book => book.status === 'to_read');
  }

  get booksCurrentlyReading(): UserBook[] {
    return this.allBooks.filter(book => book.status === 'currently_reading');
  }

  get booksRead(): UserBook[] {
    return this.allBooks.filter(book => book.status === 'read');
  }

  get favoriteBooks(): UserBook[] {
    return this.allBooks.filter(book => book.isFavourite);
  }

  get tabCounts(): LibraryTabCounts {
    return {
      all: this.allBooks.length,
      to_read: this.booksToRead.length,
      currently_reading: this.booksCurrentlyReading.length,
      read: this.booksRead.length,
      favorites: this.favoriteBooks.length
    };
  }

  setActiveTab(tab: LibraryTab): void {
    this.activeTab = tab;
  }

  onStatusChanged(updatedBook: UserBook): void {
    const index = this.allBooks.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
      this.allBooks[index] = updatedBook;
      // Notify that library has been updated
      this.libraryEvents.notifyLibraryUpdated();
    }
  }

  toggleFavorite(userBook: UserBook): void {
    this.libraryApi.toggleFavorite(userBook.id).subscribe({
      next: (updatedBook) => {
        const index = this.allBooks.findIndex(book => book.id === updatedBook.id);
        if (index !== -1) {
          this.allBooks[index] = updatedBook;
          // Notify that library has been updated
          this.libraryEvents.notifyLibraryUpdated();
        }
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
      }
    });
  }

  openReviewForm(userBook: UserBook): void {
    this.selectedBookForReview = userBook;
  }

  closeReviewForm(): void {
    this.selectedBookForReview = null;
  }

  onReviewSubmitted(updatedBook: UserBook): void {
    const index = this.allBooks.findIndex(book => book.id === updatedBook.id);
    if (index !== -1) {
      this.allBooks[index] = updatedBook;
      // Notify that library has been updated
      this.libraryEvents.notifyLibraryUpdated();
    }
    this.closeReviewForm();
  }

  removeBook(userBook: UserBook): void {
    if (confirm(`Are you sure you want to remove "${userBook.book.title}" from your library?`)) {
      this.libraryApi.removeBookFromLibrary(userBook.id).subscribe({
        next: () => {
          this.allBooks = this.allBooks.filter(book => book.id !== userBook.id);
          // Notify that library has been updated
          this.libraryEvents.notifyLibraryUpdated();
        },
        error: (error) => {
          console.error('Error removing book:', error);
        }
      });
    }
  }
}
