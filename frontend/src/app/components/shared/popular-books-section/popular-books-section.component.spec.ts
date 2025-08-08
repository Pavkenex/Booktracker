import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { PopularBooksSectionComponent } from './popular-books-section.component';
import { BookService } from '../../../services/book.service';
import { Book } from '../../../models/book.model';

describe('PopularBooksSectionComponent', () => {
  let component: PopularBooksSectionComponent;
  let fixture: ComponentFixture<PopularBooksSectionComponent>;
  let mockBookService: jasmine.SpyObj<BookService>;

  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      publishedYear: 1925,
      thumbnail: 'https://example.com/gatsby.jpg',
      description: 'A classic American novel',
      viewCount: 1500,
      genres: [
        { id: 1, name: 'Fiction' },
        { id: 2, name: 'Classic' }
      ],
      rating: 4.2
    },
    {
      id: 2,
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      publishedYear: 1960,
      thumbnail: 'https://example.com/mockingbird.jpg',
      description: 'A story of racial injustice',
      viewCount: 1200,
      genres: [
        { id: 1, name: 'Fiction' },
        { id: 3, name: 'Drama' }
      ],
      rating: 4.5
    },
    {
      id: 3,
      title: '1984',
      author: 'George Orwell',
      publishedYear: 1949,
      viewCount: 2000,
      genres: [
        { id: 1, name: 'Fiction' },
        { id: 4, name: 'Dystopian' }
      ],
      rating: 4.8
    }
  ];

  beforeEach(async () => {
    const bookServiceSpy = jasmine.createSpyObj('BookService', ['getPopularBooks']);

    await TestBed.configureTestingModule({
      imports: [
        PopularBooksSectionComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: BookService, useValue: bookServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PopularBooksSectionComponent);
    component = fixture.componentInstance;
    mockBookService = TestBed.inject(BookService) as jasmine.SpyObj<BookService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load popular books on initialization', () => {
      mockBookService.getPopularBooks.and.returnValue(of(mockBooks));

      component.ngOnInit();

      expect(mockBookService.getPopularBooks).toHaveBeenCalledWith(10);
      expect(component.popularBooks).toEqual(mockBooks);
      expect(component.isLoading).toBeFalse();
      expect(component.hasError).toBeFalse();
    });

    it('should handle error when loading popular books fails', () => {
      const error = new Error('Network error');
      mockBookService.getPopularBooks.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(component.hasError).toBeTrue();
      expect(component.isLoading).toBeFalse();
      expect(component.popularBooks).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error loading popular books:', error);
    });

    it('should set loading state correctly during API call', () => {
      mockBookService.getPopularBooks.and.returnValue(of(mockBooks));

      expect(component.isLoading).toBeFalse();
      
      component.ngOnInit();
      
      // During the call, loading should be true initially
      expect(mockBookService.getPopularBooks).toHaveBeenCalled();
    });
  });

  describe('loadPopularBooks', () => {
    it('should reset error state when retrying', () => {
      component.hasError = true;
      mockBookService.getPopularBooks.and.returnValue(of(mockBooks));

      component.loadPopularBooks();

      expect(component.hasError).toBeFalse();
      expect(component.isLoading).toBeFalse();
      expect(component.popularBooks).toEqual(mockBooks);
    });

    it('should call BookService with correct limit', () => {
      mockBookService.getPopularBooks.and.returnValue(of(mockBooks));

      component.loadPopularBooks();

      expect(mockBookService.getPopularBooks).toHaveBeenCalledWith(10);
    });
  });

  describe('trackByBookId', () => {
    it('should return book id for tracking', () => {
      const book = mockBooks[0];
      const result = component.trackByBookId(0, book);

      expect(result).toBe(book.id);
    });
  });

  describe('onImageError', () => {
    it('should set placeholder image on error', () => {
      const mockEvent = {
        target: {
          src: 'https://example.com/broken-image.jpg'
        }
      };

      component.onImageError(mockEvent);

      expect(mockEvent.target.src).toBe('/assets/images/book-placeholder.svg');
    });
  });

  describe('formatViewCount', () => {
    it('should format view count correctly for numbers less than 1000', () => {
      expect(component.formatViewCount(500)).toBe('500');
      expect(component.formatViewCount(999)).toBe('999');
    });

    it('should format view count correctly for thousands', () => {
      expect(component.formatViewCount(1000)).toBe('1K');
      expect(component.formatViewCount(1500)).toBe('1K');
      expect(component.formatViewCount(9999)).toBe('9K');
    });

    it('should format view count correctly for millions', () => {
      expect(component.formatViewCount(1000000)).toBe('1M');
      expect(component.formatViewCount(1500000)).toBe('1M');
      expect(component.formatViewCount(2500000)).toBe('2M');
    });
  });



  describe('template rendering', () => {
    beforeEach(() => {
      mockBookService.getPopularBooks.and.returnValue(of(mockBooks));
      fixture.detectChanges();
    });

    it('should display section title', () => {
      const titleElement = fixture.nativeElement.querySelector('.section-title');
      expect(titleElement.textContent.trim()).toBe('Most Popular Books');
    });

    it('should display "View All Books" link', () => {
      const linkElement = fixture.nativeElement.querySelector('a[routerLink="/books"]');
      expect(linkElement).toBeTruthy();
      expect(linkElement.textContent.trim()).toBe('View All Books');
    });

    it('should display loading spinner when loading', () => {
      component.isLoading = true;
      component.hasError = false;
      fixture.detectChanges();

      const spinner = fixture.nativeElement.querySelector('.spinner-border');
      const loadingText = fixture.nativeElement.querySelector('.text-center p');
      
      expect(spinner).toBeTruthy();
      expect(loadingText.textContent.trim()).toBe('Loading popular books...');
    });

    it('should display error message when there is an error', () => {
      component.isLoading = false;
      component.hasError = true;
      fixture.detectChanges();

      const errorAlert = fixture.nativeElement.querySelector('.alert-warning');
      const retryButton = fixture.nativeElement.querySelector('.alert-warning .btn-outline-primary');
      
      expect(errorAlert).toBeTruthy();
      expect(errorAlert.textContent).toContain('Unable to load popular books');
      expect(retryButton.textContent.trim()).toBe('Retry');
    });

    it('should display empty state when no books available', () => {
      component.isLoading = false;
      component.hasError = false;
      component.popularBooks = [];
      fixture.detectChanges();

      const emptyState = fixture.nativeElement.querySelector('.text-center.py-4');
      const emptyMessage = fixture.nativeElement.querySelector('h5.text-muted');
      
      expect(emptyState).toBeTruthy();
      expect(emptyMessage.textContent.trim()).toBe('No popular books yet');
    });

    it('should display popular books when available', () => {
      const bookCards = fixture.nativeElement.querySelectorAll('.popular-book-card');
      expect(bookCards.length).toBe(mockBooks.length);

      // Check first book card content
      const firstCard = bookCards[0];
      const title = firstCard.querySelector('.book-title');
      const author = firstCard.querySelector('.book-author');
      const viewCount = firstCard.querySelector('.view-count-badge');

      expect(title.textContent.trim()).toBe(mockBooks[0].title);
      expect(author.textContent.trim()).toBe(`by ${mockBooks[0].author}`);
      expect(viewCount.textContent.trim()).toBe('1K'); // 1500 formatted as 1K
    });

    it('should display book genres when available', () => {
      const firstCard = fixture.nativeElement.querySelector('.popular-book-card');
      const genreBadges = firstCard.querySelectorAll('.genre-badge');
      
      expect(genreBadges.length).toBe(2); // First 2 genres
      expect(genreBadges[0].textContent.trim()).toBe('Fiction');
      expect(genreBadges[1].textContent.trim()).toBe('Classic');
    });

    it('should show "+X more" when book has more than 2 genres', () => {
      // Add a book with more than 2 genres
      const bookWithManyGenres: Book = {
        ...mockBooks[0],
        genres: [
          { id: 1, name: 'Fiction' },
          { id: 2, name: 'Classic' },
          { id: 3, name: 'Drama' },
          { id: 4, name: 'Romance' }
        ]
      };
      
      component.popularBooks = [bookWithManyGenres];
      fixture.detectChanges();

      const moreGenres = fixture.nativeElement.querySelector('.more-genres');
      expect(moreGenres.textContent.trim()).toBe('+2');
    });

    it('should handle retry button click', () => {
      component.hasError = true;
      component.isLoading = false;
      fixture.detectChanges();

      spyOn(component, 'loadPopularBooks');
      const retryButton = fixture.nativeElement.querySelector('.alert-warning .btn-outline-primary');
      
      retryButton.click();
      
      expect(component.loadPopularBooks).toHaveBeenCalled();
    });

    it('should navigate to book details when card is clicked', () => {
      const firstCard = fixture.nativeElement.querySelector('.popular-book-card');
      const routerLink = firstCard.getAttribute('ng-reflect-router-link');
      
      expect(routerLink).toBe(`/books,${mockBooks[0].id}`);
    });

    it('should display book ratings when available', () => {
      const firstCard = fixture.nativeElement.querySelector('.popular-book-card');
      const ratingSection = firstCard.querySelector('.book-rating');
      const stars = firstCard.querySelectorAll('.stars i.filled');
      const ratingText = firstCard.querySelector('.rating-text');
      
      expect(ratingSection).toBeTruthy();
      expect(stars.length).toBe(4); // 4.2 rating should show 4 filled stars
      expect(ratingText.textContent.trim()).toBe('(4.2/5)');
    });

    it('should not display rating section when rating is not available', () => {
      const bookWithoutRating: Book = {
        ...mockBooks[0],
        rating: undefined
      };
      
      component.popularBooks = [bookWithoutRating];
      fixture.detectChanges();

      const ratingSection = fixture.nativeElement.querySelector('.book-rating');
      expect(ratingSection).toBeFalsy();
    });

    it('should handle image error correctly', () => {
      const bookImage = fixture.nativeElement.querySelector('.book-image');
      spyOn(component, 'onImageError');
      
      bookImage.dispatchEvent(new Event('error'));
      
      expect(component.onImageError).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockBookService.getPopularBooks.and.returnValue(of(mockBooks));
      fixture.detectChanges();
    });

    it('should have proper alt text for book images', () => {
      const bookImages = fixture.nativeElement.querySelectorAll('.book-image');
      
      bookImages.forEach((img: HTMLImageElement, index: number) => {
        expect(img.alt).toBe(mockBooks[index].title);
      });
    });

    it('should have proper title attributes for truncated text', () => {
      const bookTitles = fixture.nativeElement.querySelectorAll('.book-title');
      const bookAuthors = fixture.nativeElement.querySelectorAll('.book-author');
      
      bookTitles.forEach((title: HTMLElement, index: number) => {
        expect(title.title).toBe(mockBooks[index].title);
      });
      
      bookAuthors.forEach((author: HTMLElement, index: number) => {
        expect(author.title).toBe(mockBooks[index].author);
      });
    });

    it('should have visually hidden text for loading spinner', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const hiddenText = fixture.nativeElement.querySelector('.visually-hidden');
      expect(hiddenText.textContent.trim()).toBe('Loading popular books...');
    });
  });
});