import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiService } from "./api.service";
import {
  UserBook,
  LibraryStats,
  AddBookToLibraryRequest,
  UpdateBookStatusRequest,
} from "../models/library.model";
import { PagedResponse } from "../models/book.model";
import { ApiResponse } from "../models/book.model";

@Injectable({
  providedIn: "root",
})
export class LibraryService {
  constructor(private apiService: ApiService) {}

  getLibrary(): Observable<UserBook[]> {
    return this.apiService
      .get<PagedResponse<UserBook>>("/library?size=1000")
      .pipe(map((response) => response.content ?? []));
  }

  getLibraryStats(): Observable<LibraryStats> {
    return this.apiService
      .get<LibraryStats>("/library/stats");
  }

  addBookToLibrary(request: AddBookToLibraryRequest): Observable<UserBook> {
    return this.apiService
      .post<UserBook>("/library/books", request);
  }

  updateBookStatus(
    userBookId: number,
    request: UpdateBookStatusRequest
  ): Observable<UserBook> {
    return this.apiService
      .put<UserBook>(`/library/books/${userBookId}`, request);
  }

  removeBookFromLibrary(userBookId: number): Observable<void> {
    return this.apiService
      .delete<void>(`/library/books/${userBookId}`);
  }

  toggleFavorite(userBookId: number): Observable<UserBook> {
    return this.apiService
      .put<UserBook>(`/library/books/${userBookId}/favorite`, {});
  }

  checkBookInLibrary(
    bookId: number
  ): Observable<{ hasBook: boolean; userBook?: UserBook }> {
    return this.apiService
      .get<{ hasBook: boolean; userBook?: UserBook }>(`/library/books/check/${bookId}`);
  }

  getUserLibrary(userId: number): Observable<UserBook[]> {
    return this.apiService
      .get<PagedResponse<UserBook>>(`/library/user/${userId}?size=1000`)
      .pipe(map((response) => response.content ?? []));
  }

  getBookReviews(bookId: number, page: number = 0, size: number = 5): Observable<PagedResponse<UserBook>> {
    return this.apiService
      .get<PagedResponse<UserBook>>(`/library/book/${bookId}/reviews?page=${page}&size=${size}`);
  }
}
