import { Component, Input } from "@angular/core";

import { RouterModule } from "@angular/router";
import { Book } from "../../../models/book.model";
import { APP_CONSTANTS } from "../../../constants/app.constants";
import { FallbackImageDirective } from '../../../directives/fallback-image';

@Component({
  selector: "app-popular-book-card",
  standalone: true,
  imports: [RouterModule, FallbackImageDirective],
  template: `
    <div class="popular-book-card" [routerLink]="['/books', book.id]">
      <div class="book-thumbnail">
        <img
          [src]="book.thumbnail || defaultPlaceholder"
          [alt]="book.title"
          class="book-image"
          appFallbackImage
          [fallbackSrc]="defaultPlaceholder"
          />
          <div class="rank-badge">#{{ rank }}</div>
        </div>
    
        <div class="book-info">
          <h6 class="book-title" [title]="book.title">
            {{ book.title }}
          </h6>
          <p class="book-author" [title]="book.author">by {{ book.author }}</p>
    
          <!-- Genres if available -->
          @if (book.genres && book.genres.length > 0) {
            <div class="book-genres">
              @for (genre of book.genres.slice(0, 2); track genre) {
                <span
                  class="genre-badge"
                  >
                  {{ genre.name }}
                </span>
              }
              @if (book.genres.length > 2) {
                <span class="more-genres">
                  +{{ book.genres.length - 2 }}
                </span>
              }
            </div>
          }
        </div>
      </div>
    `,
  styles: [
    `
      .popular-book-card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
        text-decoration: none;
        color: inherit;
        display: flex;
        flex-direction: column;
        height: 100%;
        flex-shrink: 0;
        max-width: 200px;
      }

      .popular-book-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        text-decoration: none;
        color: inherit;
      }

      .book-thumbnail {
        position: relative;
        height: 240px;
        overflow: hidden;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }

      .book-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .popular-book-card:hover .book-image {
        transform: scale(1.05);
      }

      .rank-badge {
        position: absolute;
        top: 8px;
        left: 8px;
        background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
        color: #333;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 700;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        border: 2px solid white;
      }

      .book-info {
        padding: 1rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
      }

      .book-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
        line-height: 1.3;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .book-author {
        color: #666;
        font-size: 0.85rem;
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .book-genres {
        margin-top: auto;
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        align-items: center;
      }

      .genre-badge {
        background: #e9ecef;
        color: #495057;
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 0.7rem;
        font-weight: 500;
      }

      .more-genres {
        color: #6c757d;
        font-size: 0.7rem;
      }

      @media (max-width: 576px) {
        .popular-book-card {
          min-width: 160px;
        }

        .book-thumbnail {
          height: 180px;
        }

        .book-info {
          padding: 0.5rem;
        }

        .book-title {
          font-size: 0.85rem;
        }

        .book-author {
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class PopularBookCardComponent {
  @Input() book!: Book;
  @Input() rank!: number;
  @Input() defaultPlaceholder = APP_CONSTANTS.DEFAULT_BOOK_PLACEHOLDER;
}
