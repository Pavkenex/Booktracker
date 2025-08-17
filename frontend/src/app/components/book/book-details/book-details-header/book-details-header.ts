import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FallbackImageDirective } from '../../../../directives/fallback-image.directive';
import { Book } from '../../../../models/book.model';

@Component({
    selector: 'app-book-details-header',
    imports: [CommonModule, FallbackImageDirective],
    template: `
    <div class="row" *ngIf="book">
      <div class="col-md-4 col-lg-3">
        <div class="book-cover-container">
          <img
            [src]="book.thumbnail || defaultPlaceholder"
            [alt]="book.title"
            class="img-fluid book-cover"
            appFallbackImage
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
                  <span *ngFor="let genre of book.genres" class="badge bg-primary me-1">
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
        </div>
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
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  `]
})
export class BookDetailsHeaderComponent {
  @Input() book: Book | null = null;
  @Input() defaultPlaceholder: string = '/assets/images/book-placeholder.svg';
}
