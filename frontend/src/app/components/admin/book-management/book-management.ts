import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { BookService } from '../../../services/book.service';
import { Book, Genre, PagedResponse } from '../../../models/book.model';

@Component({
    selector: 'app-book-management',
    imports: [FormsModule, ReactiveFormsModule],
    template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="h3 mb-0">Book Management</h1>
            <button
              class="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#bookModal"
              (click)="openCreateModal()"
              >
              <i class="fas fa-plus me-2"></i>Add New Book
            </button>
          </div>
        </div>
      </div>
    
      <!-- Search and Filter -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-4">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Search by title..."
                    [(ngModel)]="searchTitle"
                    (input)="onSearch()"
                    >
                  </div>
                  <div class="col-md-4">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search by author..."
                      [(ngModel)]="searchAuthor"
                      (input)="onSearch()"
                      >
                    </div>
                    <div class="col-md-4">
                      <select
                        class="form-select"
                        [(ngModel)]="selectedGenreId"
                        (change)="onSearch()"
                        >
                        <option value="">All Genres</option>
                        @for (genre of genres; track genre) {
                          <option [value]="genre.id">
                            {{ genre.name }}
                          </option>
                        }
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Books Table -->
          <div class="row">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">Books ({{ booksResponse?.totalElements || 0 }} total)</h5>
                </div>
                <div class="card-body">
                  @if (!loading) {
                    <div class="table-responsive">
                      <table class="table table-striped">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Year</th>
                            <th>Genres</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (book of booksResponse?.content; track book) {
                            <tr>
                              <td>{{ book.id }}</td>
                              <td>{{ book.title }}</td>
                              <td>{{ book.author }}</td>
                              <td>{{ book.publishedYear || 'N/A' }}</td>
                              <td>
                                @for (genre of book.genres; track genre; let last = $last) {
                                  <span
                                    class="badge bg-secondary me-1"
                                    >
                                    {{ genre.name }}
                                  </span>
                                }
                              </td>
                              <td>
                                <button
                                  class="btn btn-sm btn-outline-primary me-2"
                                  data-bs-toggle="modal"
                                  data-bs-target="#bookModal"
                                  (click)="openEditModal(book)"
                                  >
                                  <i class="fas fa-edit"></i>
                                </button>
                                <button
                                  class="btn btn-sm btn-outline-danger"
                                  (click)="confirmDelete(book)"
                                  >
                                  <i class="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }
    
                  <!-- Loading State -->
                  @if (loading) {
                    <div class="text-center py-4">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  }
    
                  <!-- Empty State -->
                  @if (!loading && (!booksResponse?.content || booksResponse?.content?.length === 0)) {
                    <div class="text-center py-4">
                      <i class="fas fa-book fa-3x text-muted mb-3"></i>
                      <h5>No books found</h5>
                      <p class="text-muted">Try adjusting your search criteria or add a new book.</p>
                    </div>
                  }
    
                  <!-- Pagination -->
                  @if (booksResponse && booksResponse.totalPages > 1) {
                    <nav>
                      <ul class="pagination justify-content-center">
                        <li class="page-item" [class.disabled]="booksResponse.first">
                          <button class="page-link" (click)="goToPage(currentPage - 1)">Previous</button>
                        </li>
                        @for (page of getPageNumbers(); track page) {
                          <li
                            class="page-item"
                            [class.active]="page === currentPage"
                            >
                            <button class="page-link" (click)="goToPage(page)">{{ page + 1 }}</button>
                          </li>
                        }
                        <li class="page-item" [class.disabled]="booksResponse.last">
                          <button class="page-link" (click)="goToPage(currentPage + 1)">Next</button>
                        </li>
                      </ul>
                    </nav>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Book Modal -->
        <div class="modal fade" id="bookModal" tabindex="-1">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ isEditing ? 'Edit Book' : 'Add New Book' }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <form [formGroup]="bookForm" (ngSubmit)="onSubmit()">
                <div class="modal-body">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Title *</label>
                      <input
                        type="text"
                        class="form-control"
                        formControlName="title"
                        [class.is-invalid]="bookForm.get('title')?.invalid && bookForm.get('title')?.touched"
                        >
                        <div class="invalid-feedback">
                          Title is required
                        </div>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Author *</label>
                        <input
                          type="text"
                          class="form-control"
                          formControlName="author"
                          [class.is-invalid]="bookForm.get('author')?.invalid && bookForm.get('author')?.touched"
                          >
                          <div class="invalid-feedback">
                            Author is required
                          </div>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label">Published Year</label>
                          <input
                            type="number"
                            class="form-control"
                            formControlName="publishedYear"
                            min="1000"
                            max="2030"
                            >
                          </div>
                          <div class="col-md-6">
                            <label class="form-label">Thumbnail URL</label>
                            <input
                              type="url"
                              class="form-control"
                              formControlName="thumbnail"
                              >
                            </div>
                            <div class="col-12">
                              <label class="form-label">Description</label>
                              <textarea
                                class="form-control"
                                formControlName="description"
                                rows="3"
                              ></textarea>
                            </div>
                            <div class="col-12">
                              <label class="form-label">Genres</label>
                              <div class="row">
                                @for (genre of genres; track genre) {
                                  <div class="col-md-6">
                                    <div class="form-check">
                                      <input
                                        class="form-check-input"
                                        type="checkbox"
                                        [id]="'genre-' + genre.id"
                                        [checked]="isGenreSelected(genre.id)"
                                        (change)="toggleGenre(genre.id, $event)"
                                        >
                                        <label class="form-check-label" [for]="'genre-' + genre.id">
                                          {{ genre.name }}
                                        </label>
                                      </div>
                                    </div>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button
                              type="submit"
                              class="btn btn-primary"
                              [disabled]="bookForm.invalid || submitting"
                              >
                              @if (submitting) {
                                <span class="spinner-border spinner-border-sm me-2"></span>
                              }
                              {{ isEditing ? 'Update Book' : 'Create Book' }}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
    
                  <!-- Delete Confirmation Modal -->
                  <div class="modal fade" id="deleteModal" tabindex="-1">
                    <div class="modal-dialog">
                      <div class="modal-content">
                        <div class="modal-header">
                          <h5 class="modal-title">Confirm Delete</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                          <p>Are you sure you want to delete "<strong>{{ bookToDelete?.title }}</strong>"?</p>
                          <p class="text-danger">This action cannot be undone and will remove the book from all user libraries.</p>
                        </div>
                        <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                          <button
                            type="button"
                            class="btn btn-danger"
                            (click)="deleteBook()"
                            [disabled]="deleting"
                            >
                            @if (deleting) {
                              <span class="spinner-border spinner-border-sm me-2"></span>
                            }
                            Delete Book
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
    `
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
    private adminService: AdminService,
    private bookService: BookService,
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
    this.bookService.getGenres().subscribe({
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

    this.bookService.getBooks(params).subscribe({
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
        ? this.adminService.updateBook(this.editingBook.id, bookData)
        : this.adminService.createBook(bookData);

      operation.subscribe({
        next: () => {
          this.submitting = false;
          this.loadBooks();
          // Close modal programmatically
          const modal = document.getElementById('bookModal');
          if (modal) {
            const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
          }
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
      
      this.adminService.deleteBook(this.bookToDelete.id).subscribe({
        next: () => {
          this.deleting = false;
          this.loadBooks();
          // Close modal
          const modal = document.getElementById('deleteModal');
          if (modal) {
            const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
          }
        },
        error: (error) => {
          console.error('Error deleting book:', error);
          this.deleting = false;
        }
      });
    }
  }
}