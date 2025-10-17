import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  UserBook,
  LibraryStats,
  AddBookToLibraryRequest,
  UpdateBookStatusRequest,
} from "../models/library.model";
import { PagedResponse } from "../models/book.model";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: "root",
})
export class LibraryApi {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLibrary(): Observable<UserBook[]> {
    return this.http
      .get<PagedResponse<UserBook>>(`${this.API_URL}/library?size=1000`)
      .pipe(map((response) => response.content ?? []));
  }

  getLibraryStats(): Observable<LibraryStats> {
    return this.http
      .get<LibraryStats>(`${this.API_URL}/library/stats`);
  }

  addBookToLibrary(request: AddBookToLibraryRequest): Observable<UserBook> {
    return this.http
      .post<UserBook>(`${this.API_URL}/library/books`, request);
  }

  updateBookStatus(
    userBookId: number,
    request: UpdateBookStatusRequest
  ): Observable<UserBook> {
    return this.http
      .put<UserBook>(`${this.API_URL}/library/books/${userBookId}`, request);
  }

  removeBookFromLibrary(userBookId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/library/books/${userBookId}`);
  }

  toggleFavorite(userBookId: number): Observable<UserBook> {
    return this.http
      .put<UserBook>(`${this.API_URL}/library/books/${userBookId}/favorite`, {});
  }

  checkBookInLibrary(
    bookId: number
  ): Observable<{ hasBook: boolean; userBook?: UserBook }> {
    return this.http
      .get<{ hasBook: boolean; userBook?: UserBook }>(`${this.API_URL}/library/books/check/${bookId}`);
  }

  getUserLibrary(userId: number): Observable<UserBook[]> {
    return this.http
      .get<PagedResponse<UserBook>>(`${this.API_URL}/library/user/${userId}?size=1000`)
      .pipe(map((response) => response.content ?? []));
  }

  getBookReviews(bookId: number, page: number = 0, size: number = 5): Observable<PagedResponse<UserBook>> {
    return this.http
      .get<PagedResponse<UserBook>>(`${this.API_URL}/library/book/${bookId}/reviews?page=${page}&size=${size}`);
  }
}
