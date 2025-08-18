import { Component, Input } from "@angular/core";

import { RouterModule } from "@angular/router";
import { Book } from "../../../models/book.model";
import { APP_CONSTANTS } from "../../../constants/app.constants";
import { FallbackImageDirective } from '../../../directives/fallback-image';

@Component({
  selector: "app-popular-book-card",
  standalone: true,
  imports: [RouterModule, FallbackImageDirective],
  templateUrl: './popular-book-card.html',
  styleUrls: ['./popular-book-card.css'],
})
export class PopularBookCardComponent {
  @Input() book!: Book;
  @Input() rank!: number;
  @Input() defaultPlaceholder = APP_CONSTANTS.DEFAULT_BOOK_PLACEHOLDER;
}
