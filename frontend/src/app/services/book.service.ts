import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Book, Genre, BookSearchParams, PagedResponse } from '../models/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(private apiService: ApiService) { }

  getBooks(params: BookSearchParams = {}): Observable<PagedResponse<Book>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    
    // Check if we have meaningful filter parameters (not empty strings or undefined)
    const hasTitle = params.title && params.title.trim() !== '';
    const hasAuthor = params.author && params.author.trim() !== '';
    const hasGenre = params.genreId && params.genreId !== '' && Number(params.genreId) > 0;
    
    const hasFilters = hasTitle || hasAuthor || hasGenre;
    
    if (hasFilters) {
      // Use filter endpoint when we have search criteria
      if (hasTitle && params.title) queryParams.append('title', params.title.trim());
      if (hasAuthor && params.author) queryParams.append('author', params.author.trim());
      if (hasGenre && params.genreId) queryParams.append('genreId', params.genreId.toString());
      
      return this.apiService.get<PagedResponse<Book>>(`/books/filter?${queryParams.toString()}`);
    } else {
      // Use regular books endpoint for simple pagination
      return this.apiService.get<PagedResponse<Book>>(`/books?${queryParams.toString()}`);
    }
  }

  getBookById(id: number): Observable<Book> {
    return this.apiService.get<Book>(`/books/${id}`);
  }

  searchBooks(query: string, params: BookSearchParams = {}): Observable<PagedResponse<Book>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.genreId) queryParams.append('genreId', params.genreId.toString());

    return this.apiService.get<PagedResponse<Book>>(`/books/search?${queryParams.toString()}`);
  }

  getGenres(): Observable<Genre[]> {
    return this.apiService.get<Genre[]>('/genres');
  }

  getPopularBooks(limit: number = 10): Observable<Book[]> {
    return this.apiService.get<Book[]>(`/books/popular?limit=${limit}`);
  }

  recordBookView(bookId: number): Observable<void> {
    return this.apiService.post<void>(`/books/${bookId}/view`, {});
  }

  getSimilarBooks(bookId: number, limit: number = 12): Observable<Book[]> {
    return this.apiService.get<Book[]>(`/books/${bookId}/similar?limit=${limit}`);
  }
}