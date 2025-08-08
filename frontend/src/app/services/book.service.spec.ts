import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookService } from './book.service';
import { ApiService } from './api.service';
import { Book, Genre, PagedResponse } from '../models/book.model';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        BookService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(BookService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get books with default parameters', () => {
    const mockResponse: PagedResponse<Book> = {
      content: [
        {
          id: 1,
          title: 'Test Book',
          author: 'Test Author',
          publishedYear: 2023,
          description: 'Test description'
        }
      ],
      totalElements: 1,
      totalPages: 1,
      size: 12,
      page: 0,
      first: true,
      last: true,
      hasNext: false,
      hasPrevious: false
    };

    apiService.get.and.returnValue(jasmine.createSpy().and.returnValue({
      subscribe: (callback: any) => callback(mockResponse)
    }) as any);

    service.getBooks().subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    expect(apiService.get).toHaveBeenCalledWith('/books');
  });

  it('should get book by id', () => {
    const mockBook: Book = {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      publishedYear: 2023,
      description: 'Test description'
    };

    apiService.get.and.returnValue(jasmine.createSpy().and.returnValue({
      subscribe: (callback: any) => callback(mockBook)
    }) as any);

    service.getBookById(1).subscribe(book => {
      expect(book).toEqual(mockBook);
    });

    expect(apiService.get).toHaveBeenCalledWith('/books/1');
  });

  it('should get genres', () => {
    const mockGenres: Genre[] = [
      { id: 1, name: 'Fiction' },
      { id: 2, name: 'Non-Fiction' }
    ];

    apiService.get.and.returnValue(jasmine.createSpy().and.returnValue({
      subscribe: (callback: any) => callback(mockGenres)
    }) as any);

    service.getGenres().subscribe(genres => {
      expect(genres).toEqual(mockGenres);
    });

    expect(apiService.get).toHaveBeenCalledWith('/genres');
  });

  describe('getPopularBooks', () => {
    it('should get popular books with default limit', () => {
      const mockPopularBooks: Book[] = [
        {
          id: 1,
          title: 'Popular Book 1',
          author: 'Author 1',
          publishedYear: 2023,
          viewCount: 150
        },
        {
          id: 2,
          title: 'Popular Book 2',
          author: 'Author 2',
          publishedYear: 2022,
          viewCount: 120
        }
      ];

      apiService.get.and.returnValue(jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(mockPopularBooks)
      }) as any);

      service.getPopularBooks().subscribe(books => {
        expect(books).toEqual(mockPopularBooks);
        expect(books.length).toBe(2);
        expect(books[0].viewCount).toBe(150);
      });

      expect(apiService.get).toHaveBeenCalledWith('/books/popular?limit=10');
    });

    it('should get popular books with custom limit', () => {
      const mockPopularBooks: Book[] = [
        {
          id: 1,
          title: 'Popular Book 1',
          author: 'Author 1',
          publishedYear: 2023,
          viewCount: 150
        }
      ];

      apiService.get.and.returnValue(jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(mockPopularBooks)
      }) as any);

      service.getPopularBooks(5).subscribe(books => {
        expect(books).toEqual(mockPopularBooks);
      });

      expect(apiService.get).toHaveBeenCalledWith('/books/popular?limit=5');
    });

    it('should handle empty popular books response', () => {
      const mockPopularBooks: Book[] = [];

      apiService.get.and.returnValue(jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(mockPopularBooks)
      }) as any);

      service.getPopularBooks().subscribe(books => {
        expect(books).toEqual([]);
        expect(books.length).toBe(0);
      });

      expect(apiService.get).toHaveBeenCalledWith('/books/popular?limit=10');
    });

    it('should handle error when getting popular books', () => {
      const errorResponse = { status: 500, message: 'Server error' };

      apiService.get.and.returnValue(jasmine.createSpy().and.returnValue({
        subscribe: (successCallback: any, errorCallback: any) => errorCallback(errorResponse)
      }) as any);

      service.getPopularBooks().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });

      expect(apiService.get).toHaveBeenCalledWith('/books/popular?limit=10');
    });
  });

  describe('recordBookView', () => {
    it('should record book view successfully', () => {
      const bookId = 123;

      apiService.post.and.returnValue(jasmine.createSpy().and.returnValue({
        subscribe: (callback: any) => callback(undefined)
      }) as any);

      service.recordBookView(bookId).subscribe(result => {
        expect(result).toBeUndefined();
      });

      expect(apiService.post).toHaveBeenCalledWith('/books/123/view', {});
    });

    it('should handle error when recording book view', () => {
      const bookId = 123;
      const errorResponse = { status: 404, message: 'Book not found' };

      apiService.post.and.returnValue(jasmine.createSpy().and.returnValue({
        subscribe: (successCallback: any, errorCallback: any) => errorCallback(errorResponse)
      }) as any);

      service.recordBookView(bookId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error).toEqual(errorResponse);
        }
      });

      expect(apiService.post).toHaveBeenCalledWith('/books/123/view', {});
    });

    it('should handle different book IDs', () => {
      const bookIds = [1, 999, 42];

      bookIds.forEach(bookId => {
        apiService.post.and.returnValue(jasmine.createSpy().and.returnValue({
          subscribe: (callback: any) => callback(undefined)
        }) as any);

        service.recordBookView(bookId).subscribe();

        expect(apiService.post).toHaveBeenCalledWith(`/books/${bookId}/view`, {});
      });

      expect(apiService.post).toHaveBeenCalledTimes(3);
    });
  });
});