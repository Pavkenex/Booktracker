import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { BookApi } from './book-api';
import { Book, Genre } from "../models/book.model";
import { environment } from '../../environments/environment';

export interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  totalGenres: number;
}

export interface PopularityStatistics {
  bookId: number;
  title: string;
  author: string;
  viewCount: number;
  percentage: number;
  rank: number;
}

@Injectable({
  providedIn: "root",
})
export class AdminApi {
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private bookApi: BookApi
  ) {}

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API_URL}/admin/stats`);
  }

  createBook(book: Omit<Book, "id">): Observable<Book> {
    return this.http.post<Book>(`${this.API_URL}/admin/books`, book);
  }

  updateBook(id: number, book: Partial<Book>): Observable<Book> {
    return this.http.put<Book>(`${this.API_URL}/admin/books/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/admin/books/${id}`);
  }

  createGenre(genre: Omit<Genre, "id">): Observable<Genre> {
    return this.http
      .post<Genre>(`${this.API_URL}/admin/genres`, genre);
  }

  updateGenre(id: number, genre: Partial<Genre>): Observable<Genre> {
    return this.http
      .put<Genre>(`${this.API_URL}/admin/genres/${id}`, genre);
  }

  deleteGenre(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/admin/genres/${id}`);
  }

  getAllGenres(): Observable<Genre[]> {
    return this.http
      .get<Genre[]>(`${this.API_URL}/genres`);
  }

  getBooksByCategoryReport(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/admin/reports/books-by-category`);
  }

  getDailyActivityReport(): Observable<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return this.http.get<any>(`${this.API_URL}/admin/reports/daily-activity?startDate=${startDateStr}&endDate=${endDateStr}`);
  }

  getUserEngagementReport(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/admin/reports/user-engagement`);
  }

  getPopularityStatistics(): Observable<PopularityStatistics[]> {
    return this.http.get<PopularityStatistics[]>(
      `${this.API_URL}/admin/popularity/statistics`
    );
  }

  exportPopularityStatistics(format: "csv" | "pdf"): Observable<Blob> {
    return this.http.get(`${this.API_URL}/admin/popularity/export?format=${format}`, { responseType: 'blob' });
  }

  exportReport(reportType: string, format: "pdf" | "excel"): Observable<Blob> {
    const endpointMap: { [key: string]: string } = {
      "books-by-category": "/admin/reports/books-by-category/export",
      "daily-activity": "/admin/reports/daily-activity/export",
      "user-engagement": "/admin/reports/user-engagement/export",
    };

    const endpoint = endpointMap[reportType];
    if (!endpoint) {
      const mockContent = `Mock ${reportType} report in ${format} format`;
      const blob = new Blob([mockContent], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      return of(blob);
    }

    if (reportType === "daily-activity") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      return this.http.get(
        `${this.API_URL}${endpoint}?format=${format}&startDate=${startDateStr}&endDate=${endDateStr}`,
        { responseType: 'blob' }
      );
    }

    return this.http.get(`${this.API_URL}${endpoint}?format=${format}`, { responseType: 'blob' });
  }
}
