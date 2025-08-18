import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Book } from '../../../models/book.model';

@Component({
    selector: 'app-book-card',
    imports: [CommonModule, RouterModule],
    templateUrl: './book-card.html',
    styleUrls: ['./book-card.css']
})
export class BookCardComponent {
  @Input() book!: Book;

  onImageError(event: any): void {
    event.target.src = '/assets/images/book-placeholder.svg';
  }
}
