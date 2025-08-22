import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApi } from '../../../services/admin-api';
import { BookApi } from '../../../services/book-api';
import { Book, Genre, PagedResponse } from '../../../models/book.model';

@Component({
    selector: 'app-book-management',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './book-management.html',
    styleUrls: ['./book-management.css']
})
export class BookManagementComponent implements OnInit {
  booksResponse: PagedResponse<Book> | null = null;
  genres: Genre[] = [];
  bookForm: FormGroup;
  selectedGenres: number[] = [];
  
  // Search and pagination
  searchTitle = '';
  searchAuthor = '';
  selectedGenreId = '';
  currentPage = 0;
  pageSize = 10;
  
  // Modal states
  isEditing = false;
  editingBook: Book | null = null;
  bookToDelete: Book | null = null;
  
  // Loading states
  loading = false;
  submitting = false;
  deleting = false;

  constructor(
    private adminApi: AdminApi,
    private bookApi: BookApi,
    private fb: FormBuilder
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      publishedYear: [''],
      thumbnail: [''],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadGenres();
    this.loadBooks();
  }

  loadGenres(): void {
    this.bookApi.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
      },
      error: (error) => {
        console.error('Error loading genres:', error);
      }
    });
  }

  loadBooks(): void {
    this.loading = true;
    
    const params = {
      page: this.currentPage,
      size: this.pageSize,
      title: this.searchTitle || undefined,
      author: this.searchAuthor || undefined,
      genreId: this.selectedGenreId ? parseInt(this.selectedGenreId) : undefined
    };

    this.bookApi.getBooks(params).subscribe({
      next: (response) => {
        this.booksResponse = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadBooks();
  }

  goToPage(page: number): void {
    if (page >= 0 && this.booksResponse && page < this.booksResponse.totalPages) {
      this.currentPage = page;
      this.loadBooks();
    }
  }

  getPageNumbers(): number[] {
    if (!this.booksResponse) return [];
    
    const totalPages = this.booksResponse.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];
    
    const start = Math.max(0, current - 2);
    const end = Math.min(totalPages - 1, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingBook = null;
    this.selectedGenres = [];
    this.bookForm.reset();
  }

  openEditModal(book: Book): void {
    this.isEditing = true;
    this.editingBook = book;
    this.selectedGenres = book.genres?.map(g => g.id) || [];
    
    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      publishedYear: book.publishedYear,
      thumbnail: book.thumbnail,
      description: book.description
    });
  }

  isGenreSelected(genreId: number): boolean {
    return this.selectedGenres.includes(genreId);
  }

  toggleGenre(genreId: number, event: any): void {
    if (event.target.checked) {
      this.selectedGenres.push(genreId);
    } else {
      this.selectedGenres = this.selectedGenres.filter(id => id !== genreId);
    }
  }

  onSubmit(): void {
    if (this.bookForm.valid) {
      this.submitting = true;
      
      const bookData = {
        ...this.bookForm.value,
        genreIds: this.selectedGenres
      };

      const operation = this.isEditing && this.editingBook
        ? this.adminApi.updateBook(this.editingBook.id, bookData)
        : this.adminApi.createBook(bookData);

      operation.subscribe({
        next: () => {
          this.submitting = false;
          this.loadBooks();
          // Close modal using the centralized method
          this.closeModal('bookModal');
        },
        error: (error) => {
          console.error('Error saving book:', error);
          this.submitting = false;
        }
      });
    }
  }

  confirmDelete(book: Book): void {
    this.bookToDelete = book;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }

  deleteBook(): void {
    if (this.bookToDelete) {
      this.deleting = true;
      
      this.adminApi.deleteBook(this.bookToDelete.id).subscribe({
        next: () => {
          this.deleting = false;
          this.loadBooks();
          // Close modal using the centralized method
          this.closeModal('deleteModal');
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          this.deleting = false;
        }
      });
    }
  }

  closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      // Get or create modal instance
      let bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (!bsModal) {
        bsModal = new (window as any).bootstrap.Modal(modal);
      }
      
      // Hide the modal
      bsModal.hide();
      
      // Force cleanup after modal animation
      setTimeout(() => {
        // Remove any lingering backdrops
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        
        // Only reset body styles if no other modals are open
        const openModals = document.querySelectorAll('.modal.show');
        if (openModals.length === 0) {
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('padding-right');
        }
        
        // Clean up form state
        if (modalId === 'bookModal') {
          this.bookForm.reset();
          this.isEditing = false;
          this.editingBook = null;
          this.selectedGenres = [];
        } else if (modalId === 'deleteModal') {
          this.bookToDelete = null;
        }
      }, 200);
    }
  }
}
