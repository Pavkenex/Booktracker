import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApi } from '../../../services/admin-api';
import { Genre } from '../../../models/book.model';

@Component({
    selector: 'app-genre-management',
    imports: [FormsModule, ReactiveFormsModule],
    templateUrl: './genre-management.html',
    styleUrls: ['./genre-management.css']
})
export class GenreManagementComponent implements OnInit {
  genres: Genre[] = [];
  filteredGenres: Genre[] = [];
  genreForm: FormGroup;
  searchTerm = '';
  
  // Modal states
  isEditing = false;
  editingGenre: Genre | null = null;
  genreToDelete: Genre | null = null;
  
  // Loading states
  loading = false;
  submitting = false;
  deleting = false;
  
  // Messages
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private adminApi: AdminApi,
    private fb: FormBuilder
  ) {
    this.genreForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.loadGenres();
  }

  loadGenres(): void {
    this.loading = true;
    
    this.adminApi.getAllGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.filteredGenres = genres;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading genres:', error);
        this.errorMessage = 'Failed to load genres. Please try again.';
        this.loading = false;
      }
    });
  }

  filterGenres(): void {
    if (!this.searchTerm.trim()) {
      this.filteredGenres = this.genres;
    } else {
      this.filteredGenres = this.genres.filter(genre =>
        genre.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingGenre = null;
    this.genreForm.reset();
    this.clearMessages();
  }

  openEditModal(genre: Genre): void {
    this.isEditing = true;
    this.editingGenre = genre;
    this.genreForm.patchValue({
      name: genre.name
    });
    this.clearMessages();
  }

  onSubmit(): void {
    if (this.genreForm.valid) {
      this.submitting = true;
      this.clearMessages();
      
      const genreData = this.genreForm.value;

      const operation = this.isEditing && this.editingGenre
        ? this.adminApi.updateGenre(this.editingGenre.id, genreData)
        : this.adminApi.createGenre(genreData);

      operation.subscribe({
        next: (genre) => {
          this.submitting = false;
          this.successMessage = this.isEditing 
            ? 'Genre updated successfully!' 
            : 'Genre created successfully!';
          this.loadGenres();
          this.closeModal('genreModal');
        },
        error: (error) => {
          console.error('Error saving genre:', error);
          this.errorMessage = error.error?.message || 'Failed to save genre. Please try again.';
          this.submitting = false;
        }
      });
    }
  }

  confirmDelete(genre: Genre): void {
    this.genreToDelete = genre;
    this.clearMessages();
    const modal = new (window as any).bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }

  deleteGenre(): void {
    if (this.genreToDelete) {
      this.deleting = true;
      this.clearMessages();
      
      this.adminApi.deleteGenre(this.genreToDelete.id).subscribe({
        next: () => {
          this.deleting = false;
          this.successMessage = 'Genre deleted successfully!';
          this.loadGenres();
          this.closeModal('deleteModal');
        },
        error: (error) => {
          console.error('Error deleting genre:', error);
          this.errorMessage = error.error?.message || 
            'Failed to delete genre. Make sure no books are assigned to this genre first.';
          this.deleting = false;
        }
      });
    }
  }

  private closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    }
  }

  private clearMessages(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}
