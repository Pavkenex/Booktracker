import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, Genre, BookSearchParams, PagedResponse } from '../models/book.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookApi {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getBooks(params: BookSearchParams = {}): Observable<PagedResponse<Book>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    
    const hasTitle = params.title && params.title.trim() !== '';
    const hasAuthor = params.author && params.author.trim() !== '';
    const hasGenre = params.genreId && params.genreId !== '' && Number(params.genreId) > 0;
    
    const hasFilters = hasTitle || hasAuthor || hasGenre;
    
    if (hasFilters) {
      if (hasTitle && params.title) queryParams.append('title', params.title.trim());
      if (hasAuthor && params.author) queryParams.append('author', params.author.trim());
      if (hasGenre && params.genreId) queryParams.append('genreId', params.genreId.toString());
      
      return this.http.get<PagedResponse<Book>>(`${this.API_URL}/books/filter?${queryParams.toString()}`);
    } else {
      return this.http.get<PagedResponse<Book>>(`${this.API_URL}/books?${queryParams.toString()}`);
    }
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.API_URL}/books/${id}`);
  }

  searchBooks(query: string, params: BookSearchParams = {}): Observable<PagedResponse<Book>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.genreId) queryParams.append('genreId', params.genreId.toString());

    return this.http.get<PagedResponse<Book>>(`${this.API_URL}/books/search?${queryParams.toString()}`);
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.API_URL}/genres`);
  }

  getPopularBooks(limit: number = 10): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.API_URL}/books/popular?limit=${limit}`);
  }

  recordBookView(bookId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/books/${bookId}/view`, {});
  }

  getSimilarBooks(bookId: number, limit: number = 12): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.API_URL}/books/${bookId}/similar?limit=${limit}`);
  }
}
