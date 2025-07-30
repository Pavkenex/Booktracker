import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService, AdminStats } from './admin.service';
import { ApiService } from './api.service';
import { BookService } from './book.service';
import { Book, Genre } from '../models/book.model';
import { of } from 'rxjs';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  let apiService: jasmine.SpyObj<ApiService>;
  let bookService: jasmine.SpyObj<BookService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete', 'getBlob']);
    const bookServiceSpy = jasmine.createSpyObj('BookService', ['getGenres']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AdminService,
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: BookService, useValue: bookServiceSpy }
      ]
    });

    service = TestBed.inject(AdminService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    bookService = TestBed.inject(BookService) as jasmine.SpyObj<BookService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get admin stats', () => {
    service.getAdminStats().subscribe(stats => {
      expect(stats).toBeDefined();
      expect(stats.totalUsers).toBeGreaterThan(0);
      expect(stats.totalBooks).toBeGreaterThan(0);
      expect(stats.totalGenres).toBeGreaterThan(0);
      expect(stats.recentActivity).toBeDefined();
    });
  });

  it('should create book', () => {
    const mockBook: Omit<Book, 'id'> = {
      title: 'Test Book',
      author: 'Test Author',
      publishedYear: 2023,
      description: 'Test description'
    };

    service.createBook(mockBook);
    expect(apiService.post).toHaveBeenCalledWith('/books', mockBook);
  });

  it('should update book', () => {
    const bookId = 1;
    const mockBook: Partial<Book> = {
      title: 'Updated Book',
      author: 'Updated Author'
    };

    service.updateBook(bookId, mockBook);
    expect(apiService.put).toHaveBeenCalledWith('/books/1', mockBook);
  });

  it('should delete book', () => {
    const bookId = 1;

    service.deleteBook(bookId);
    expect(apiService.delete).toHaveBeenCalledWith('/books/1');
  });

  it('should create genre', () => {
    const mockGenre: Omit<Genre, 'id'> = {
      name: 'Test Genre'
    };
    const mockResponse = { data: { id: 1, name: 'Test Genre' } };

    apiService.post.and.returnValue(of(mockResponse));

    service.createGenre(mockGenre).subscribe(genre => {
      expect(genre).toEqual(mockResponse.data);
    });
    expect(apiService.post).toHaveBeenCalledWith('/admin/genres', mockGenre);
  });

  it('should update genre', () => {
    const genreId = 1;
    const mockGenre: Partial<Genre> = {
      name: 'Updated Genre'
    };
    const mockResponse = { data: { id: 1, name: 'Updated Genre' } };

    apiService.put.and.returnValue(of(mockResponse));

    service.updateGenre(genreId, mockGenre).subscribe(genre => {
      expect(genre).toEqual(mockResponse.data);
    });
    expect(apiService.put).toHaveBeenCalledWith('/admin/genres/1', mockGenre);
  });

  it('should delete genre', () => {
    const genreId = 1;

    service.deleteGenre(genreId);
    expect(apiService.delete).toHaveBeenCalledWith('/admin/genres/1');
  });

  it('should get all genres', () => {
    const mockGenres: Genre[] = [
      { id: 1, name: 'Fiction' },
      { id: 2, name: 'Non-Fiction' }
    ];
    const mockResponse = { data: mockGenres };

    apiService.get.and.returnValue(of(mockResponse));

    service.getAllGenres().subscribe(genres => {
      expect(genres).toEqual(mockGenres);
    });
    expect(apiService.get).toHaveBeenCalledWith('/admin/genres');
  });

  it('should get books by category report', () => {
    service.getBooksByCategoryReport().subscribe(data => {
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  it('should get daily activity report', () => {
    service.getDailyActivityReport().subscribe(data => {
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(30); // 30 days of mock data
    });
  });

  it('should get user engagement report', () => {
    service.getUserEngagementReport().subscribe(data => {
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  it('should export report', () => {
    const reportType = 'books-by-category';
    const format = 'pdf';
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });

    apiService.getBlob.and.returnValue(of(mockBlob));

    service.exportReport(reportType, format).subscribe(blob => {
      expect(blob).toBeInstanceOf(Blob);
    });
    
    expect(apiService.getBlob).toHaveBeenCalledWith('/admin/reports/books-by-category/export?format=pdf');
  });
});