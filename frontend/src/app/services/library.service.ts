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
      .get<{ success: boolean; data: PagedResponse<UserBook> }>("/library?size=1000")
      .pipe(map((response) => response.data.content ?? []));
  }

  getLibraryStats(): Observable<LibraryStats> {
    return this.apiService
      .get<{ success: boolean; data: LibraryStats }>("/library/stats")
      .pipe(map((response) => response.data));
  }

  addBookToLibrary(request: AddBookToLibraryRequest): Observable<UserBook> {
    return this.apiService
      .post<{ success: boolean; data: UserBook }>("/library/books", request)
      .pipe(map((response) => response.data));
  }

  updateBookStatus(
    userBookId: number,
    request: UpdateBookStatusRequest
  ): Observable<UserBook> {
    return this.apiService
      .put<{ success: boolean; data: UserBook }>(
        `/library/books/${userBookId}`,
        request
      )
      .pipe(map((response) => response.data));
  }

  removeBookFromLibrary(userBookId: number): Observable<void> {
    return this.apiService
      .delete<{ success: boolean }>(`/library/books/${userBookId}`)
      .pipe(map(() => void 0));
  }

  toggleFavorite(userBookId: number): Observable<UserBook> {
    return this.apiService
      .put<{ success: boolean; data: UserBook }>(
        `/library/books/${userBookId}/favorite`,
        {}
      )
      .pipe(map((response) => response.data));
  }

  checkBookInLibrary(
    bookId: number
  ): Observable<{ hasBook: boolean; userBook?: UserBook }> {
    return this.apiService
      .get<any>(`/library/books/check/${bookId}`)
      .pipe(
        map((response) => {
          // If response.data exists, use it; else fallback to root
          const data = response.data || response;
          return {
            hasBook: data.hasBook,
            userBook: data.userBook,
          };
        })
      );
  }

  getUserLibrary(userId: number): Observable<UserBook[]> {
    return this.apiService
      .get<ApiResponse<PagedResponse<UserBook>>>(
        `/library/user/${userId}?size=1000`
      )
      .pipe(map((response) => response.data.content ?? []));
  }

  getBookReviews(bookId: number, page: number = 0, size: number = 5): Observable<PagedResponse<UserBook>> {
    return this.apiService
      .get<{ success: boolean; data: PagedResponse<UserBook> }>(`/library/book/${bookId}/reviews?page=${page}&size=${size}`)
      .pipe(map(r => r.data));
  }
}
