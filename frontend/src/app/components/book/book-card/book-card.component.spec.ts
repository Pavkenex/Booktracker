import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BookCardComponent } from './book-card.component';
import { Book } from '../../../models/book.model';

describe('BookCardComponent', () => {
  let component: BookCardComponent;
  let fixture: ComponentFixture<BookCardComponent>;

  const mockBook: Book = {
    id: 1,
    title: 'Test Book Title',
    author: 'Test Author',
    publishedYear: 2023,
    description: 'This is a test book description that is longer than 100 characters to test the truncation functionality in the component.',
    thumbnail: 'test-image.jpg',
    genres: [
      { id: 1, name: 'Fiction' },
      { id: 2, name: 'Adventure' },
      { id: 3, name: 'Mystery' }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCardComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    component = fixture.componentInstance;
    component.book = mockBook;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display book information correctly', () => {
    const compiled = fixture.nativeElement;
    
    expect(compiled.querySelector('.card-title').textContent).toContain('Test Book Title');
    expect(compiled.querySelector('.card-text').textContent).toContain('by Test Author');
    expect(compiled.textContent).toContain('Published: 2023');
  });

  it('should display genres with limit of 2', () => {
    const compiled = fixture.nativeElement;
    const genreBadges = compiled.querySelectorAll('.badge');
    
    expect(genreBadges.length).toBe(2);
    expect(genreBadges[0].textContent.trim()).toBe('Fiction');
    expect(genreBadges[1].textContent.trim()).toBe('Adventure');
    expect(compiled.textContent).toContain('+1 more');
  });

  it('should truncate long descriptions', () => {
    const compiled = fixture.nativeElement;
    const descriptionElement = compiled.querySelector('.card-text.flex-grow-1');
    
    expect(descriptionElement.textContent.length).toBeLessThanOrEqual(103); // 100 chars + "..."
    expect(descriptionElement.textContent).toContain('...');
  });

  it('should have correct router link', () => {
    const compiled = fixture.nativeElement;
    const button = compiled.querySelector('button[routerLink]');
    
    expect(button).toBeTruthy();
    expect(button.textContent.trim()).toBe('View Details');
  });

  it('should handle image error', () => {
    const mockEvent = {
      target: {
        src: 'test-image.jpg'
      }
    };

    component.onImageError(mockEvent);
    
    expect(mockEvent.target.src).toBe('/assets/images/book-placeholder.svg');
  });
});