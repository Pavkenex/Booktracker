import { Component, Input } from '@angular/core';

import { FallbackImageDirective } from '../../../../directives/fallback-image';
import { Book } from '../../../../models/book.model';

@Component({
    selector: 'app-book-details-header',
    imports: [FallbackImageDirective],
    templateUrl: './book-details-header.html',
    styleUrls: ['./book-details-header.css']
})
export class BookDetailsHeaderComponent {
  @Input() book: Book | null = null;
  @Input() defaultPlaceholder: string = '/assets/images/book-placeholder.svg';
}
