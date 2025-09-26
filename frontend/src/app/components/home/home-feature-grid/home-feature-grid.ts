import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home-feature-grid',
    imports: [CommonModule],
    templateUrl: './home-feature-grid.html',
    styleUrls: ['./home-feature-grid.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeFeatureGridComponent {
  readonly features = [
    {
      icon: 'fas fa-book-reader',
      title: 'Track Your Reading',
      description:
        'Keep track of books you want to read, are currently reading, and have completed.'
    },
    {
      icon: 'fas fa-search',
      title: 'Discover Books',
      description: 'Browse our extensive catalog and discover your next favorite book.'
    },
    {
      icon: 'fas fa-users',
      title: 'Connect with Friends',
      description: 'Share recommendations and discuss books with your friends.'
    }
  ];
}
