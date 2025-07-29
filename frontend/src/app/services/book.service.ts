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
    if (params.title) queryParams.append('title', params.title);
    if (params.author) queryParams.append('author', params.author);
    if (params.genreId) queryParams.append('genreId', params.genreId.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/books?${queryString}` : '/books';
    
    return this.apiService.get<PagedResponse<Book>>(endpoint);
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
    return this.apiService.get<Genre[]>('/books/categories');
  }
}