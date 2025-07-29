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
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get']);

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
      number: 0,
      first: true,
      last: true
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

    expect(apiService.get).toHaveBeenCalledWith('/books/categories');
  });
});