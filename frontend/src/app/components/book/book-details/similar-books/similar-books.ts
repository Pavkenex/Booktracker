import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { RouterModule } from '@angular/router';
import { FallbackImageDirective } from '../../../../directives/fallback-image';
import { Book } from '../../../../models/book.model';

@Component({
    selector: 'app-similar-books',
    imports: [RouterModule, FallbackImageDirective],
    templateUrl: './similar-books.html',
    styleUrls: ['./similar-books.css']
})
export class SimilarBooksComponent {
  @Input() similarBooks: Book[] = [];
  @Output() navigateToBook = new EventEmitter<number>();

  @ViewChild('similarSlider') similarSlider?: ElementRef<HTMLElement>;

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  onScrollPrevious(): void {
    this.scrollSimilar('prev');
  }

  onScrollNext(): void {
    this.scrollSimilar('next');
  }

  onNavigateToBook(bookId: number): void {
    this.navigateToBook.emit(bookId);
  }

  private scrollSimilar(direction: 'prev' | 'next'): void {
    const el = this.similarSlider?.nativeElement;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ 
      left: direction === 'next' ? amount : -amount, 
      behavior: 'smooth' 
    });
  }
}
