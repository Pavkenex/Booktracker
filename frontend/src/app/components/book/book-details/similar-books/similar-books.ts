import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FallbackImageDirective } from '../../../../directives/fallback-image';
import { Book } from '../../../../models/book.model';
import { SliderComponent } from '../../../shared/slider/slider.component';
import { SliderItemDirective } from '../../../shared/slider/slider-item.directive';
import { APP_CONSTANTS } from '../../../../constants/app.constants';

@Component({
  selector: 'app-similar-books',
  imports: [RouterModule, FallbackImageDirective, SliderComponent, SliderItemDirective],
  templateUrl: './similar-books.html',
  styleUrls: ['./similar-books.css']
})
export class SimilarBooksComponent {
  @Input() similarBooks: Book[] = [];
  @Output() navigateToBook = new EventEmitter<number>();

  protected readonly sliderBreakpoints = APP_CONSTANTS.POPULAR_BOOKS.BREAKPOINTS;
  protected readonly sliderItemsConfig = {
    MOBILE: 2,
    TABLET: 3,
    DESKTOP: 4,
    LARGE: 5,
  } as const;

  trackByBookId(index: number, book: Book): number {
    return book.id;
  }

  onNavigateToBook(bookId: number): void {
    this.navigateToBook.emit(bookId);
  }
}
