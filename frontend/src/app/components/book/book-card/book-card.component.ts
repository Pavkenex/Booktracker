import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card h-100 book-card">
      <div class="card-img-container">
        <img 
          [src]="book.thumbnail || '/assets/images/book-placeholder.svg'" 
          [alt]="book.title"
          class="card-img-top"
          (error)="onImageError($event)"
        />
      </div>
      <div class="card-body d-flex flex-column">
        <h6 class="card-title text-truncate" [title]="book.title">{{ book.title }}</h6>
        <p class="card-text text-muted small mb-2">by {{ book.author }}</p>
        <p class="card-text text-muted small mb-2" *ngIf="book.publishedYear">
          Published: {{ book.publishedYear }}
        </p>
        <div class="genres mb-2" *ngIf="book.genres && book.genres.length > 0">
          <span 
            *ngFor="let genre of book.genres.slice(0, 2)" 
            class="badge bg-secondary me-1 small"
          >
            {{ genre.name }}
          </span>
          <span *ngIf="book.genres.length > 2" class="text-muted small">
            +{{ book.genres.length - 2 }} more
          </span>
        </div>
        <p class="card-text flex-grow-1" *ngIf="book.description">
          {{ book.description | slice:0:100 }}{{ book.description.length > 100 ? '...' : '' }}
        </p>
        <div class="mt-auto">
          <button 
            class="btn btn-primary btn-sm w-100"
            [routerLink]="['/books', book.id]"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-card {
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      cursor: pointer;
    }

    .book-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .card-img-container {
      height: 200px;
      overflow: hidden;
      background-color: #f8f9fa;
    }

    .card-img-top {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-title {
      font-weight: 600;
      color: #333;
    }

    .genres {
      min-height: 20px;
    }

    .badge {
      font-size: 0.7rem;
    }

    @media (max-width: 576px) {
      .card-img-container {
        height: 150px;
      }
    }
  `]
})
export class BookCardComponent {
  @Input() book!: Book;

  onImageError(event: any): void {
    event.target.src = '/assets/images/book-placeholder.svg';
  }
}