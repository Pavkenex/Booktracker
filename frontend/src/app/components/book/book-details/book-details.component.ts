import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { BookService } from '../../../services/book.service';
import { LibraryService } from '../../../services/library.service';
import { Book } from '../../../models/book.model';
import { UserBook } from '../../../models/library.model';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="row" *ngIf="book; else loading">
        <div class="col-12">
          <button 
            class="btn btn-outline-secondary mb-3"
            (click)="goBack()"
          >
            <i class="fas fa-arrow-left me-2"></i>Back to Catalog
          </button>
        </div>
        
        <div class="col-md-4 col-lg-3">
          <div class="book-cover-container">
            <img 
              [src]="book.thumbnail || '/assets/images/book-placeholder.svg'"
              [alt]="book.title"
              class="img-fluid book-cover"
              (error)="onImageError($event)"
            />
          </div>
        </div>
        
        <div class="col-md-8 col-lg-9">
          <div class="book-info">
            <h1 class="book-title">{{ book.title }}</h1>
            <h4 class="book-author text-muted mb-3">by {{ book.author }}</h4>
            
            <div class="book-meta mb-4">
              <div class="row">
                <div class="col-sm-6" *ngIf="book.publishedYear">
                  <strong>Published:</strong> {{ book.publishedYear }}
                </div>
                <div class="col-sm-6" *ngIf="book.genres && book.genres.length > 0">
                  <strong>Genres:</strong>
                  <div class="mt-1">
                    <span 
                      *ngFor="let genre of book.genres" 
                      class="badge bg-primary me-1"
                    >
                      {{ genre.name }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="book-description" *ngIf="book.description">
              <h5>Description</h5>
              <p class="lead">{{ book.description }}</p>
            </div>
            
            <div class="book-actions mt-4">
              <div class="btn-group" role="group">
                <button 
                  class="btn btn-success"
                  (click)="addToLibrary('to_read')"
                  [disabled]="addingToLibrary">
                  <span *ngIf="addingToLibrary" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!addingToLibrary" class="fas fa-plus me-2"></i>
                  Want to Read
                </button>
                <button 
                  class="btn btn-primary"
                  (click)="addToLibrary('read')"
                  [disabled]="addingToLibrary">
                  <span *ngIf="addingToLibrary" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!addingToLibrary" class="fas fa-check me-2"></i>
                  Mark as Read
                </button>
                <button class="btn btn-outline-info">
                  <i class="fas fa-share me-2"></i>Recommend
                </button>
              </div>
              
              <!-- Success Message -->
              <div *ngIf="libraryMessage" class="alert alert-success mt-3" role="alert">
                <i class="fas fa-check-circle me-2"></i>{{ libraryMessage }}
                <a routerLink="/library" class="alert-link ms-2">View Library</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ng-template #loading>
        <div class="d-flex justify-content-center align-items-center" style="min-height: 400px;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </ng-template>
      
      <div class="alert alert-danger mt-4" *ngIf="error">
        <h5>Error Loading Book</h5>
        <p>{{ error }}</p>
        <button class="btn btn-outline-danger" (click)="loadBook()">
          Try Again
        </button>
      </div>
    </div>
  `,
  styles: [`
    .book-cover-container {
      text-align: center;
      margin-bottom: 2rem;
    }

    .book-cover {
      max-height: 400px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .book-title {
      color: #333;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .book-author {
      font-style: italic;
    }

    .book-meta {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
    }

    .book-description {
      margin-top: 2rem;
    }

    .book-actions {
      border-top: 1px solid #dee2e6;
      padding-top: 1rem;
    }

    .badge {
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .book-cover {
        max-height: 300px;
      }
      
      .btn-group {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      
      .btn-group .btn {
        margin-bottom: 0.5rem;
        border-radius: 0.375rem !important;
      }
    }
  `]
})
export class BookDetailsComponent implements OnInit, OnDestroy {
  book: Book | null = null;
  error: string | null = null;
  addingToLibrary = false;
  libraryMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService,
    private libraryService: LibraryService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const bookId = +params['id'];
        if (bookId) {
          this.loadBook(bookId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBook(bookId?: number): void {
    const id = bookId || +(this.route.snapshot.params['id']);
    this.error = null;
    
    this.bookService.getBookById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (book) => {
          this.book = book;
        },
        error: (error) => {
          console.error('Error loading book:', error);
          this.error = 'Failed to load book details. Please try again.';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/book-placeholder.svg';
  }

  addToLibrary(status: 'read' | 'to_read'): void {
    if (!this.book || this.addingToLibrary) {
      return;
    }

    this.addingToLibrary = true;
    this.libraryMessage = null;

    const request = {
      bookId: this.book.id,
      status: status,
      isFavourite: false
    };

    this.libraryService.addBookToLibrary(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (userBook) => {
          this.addingToLibrary = false;
          const statusText = status === 'read' ? 'Read' : 'Want to Read';
          this.libraryMessage = `"${this.book!.title}" has been added to your ${statusText} list!`;
          
          // Clear message after 5 seconds
          setTimeout(() => {
            this.libraryMessage = null;
          }, 5000);
        },
        error: (error) => {
          console.error('Error adding book to library:', error);
          this.addingToLibrary = false;
          this.error = 'Failed to add book to library. Please try again.';
        }
      });
  }
}