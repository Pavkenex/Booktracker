import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { ApiClient } from './api-client';
import { BookApi } from './book-api';
import { Book, Genre } from "../models/book.model";

export interface AdminStats {
  totalUsers: number;
  totalBooks: number;
  totalGenres: number;
}

export interface ReportData {
  booksByCategory: { category: string; count: number }[];
  dailyActivity: {
    date: string;
    users: number;
    books: number;
    reviews: number;
  }[];
  userEngagement: { metric: string; value: number }[];
}

export interface PopularityStatistics {
  id: number;
  title: string;
  author: string;
  viewCount: number;
  thumbnail?: string;
  rating?: number;
}

@Injectable({
  providedIn: "root",
})
export class AdminApi {
  constructor(
    private apiClient: ApiClient,
    private bookApi: BookApi
  ) {}

  // Dashboard stats
  getAdminStats(): Observable<AdminStats> {
    return this.apiClient.get<AdminStats>('/admin/stats');
  }

  // Book management
  createBook(book: Omit<Book, "id">): Observable<Book> {
    return this.apiClient.post<Book>("/books", book);
  }

  updateBook(id: number, book: Partial<Book>): Observable<Book> {
    return this.apiClient.put<Book>(`/books/${id}`, book);
  }

  deleteBook(id: number): Observable<void> {
    return this.apiClient.delete<void>(`/books/${id}`);
  }

  // Genre management
  createGenre(genre: Omit<Genre, "id">): Observable<Genre> {
    return this.apiClient
      .post<Genre>("/admin/genres", genre);
  }

  updateGenre(id: number, genre: Partial<Genre>): Observable<Genre> {
    return this.apiClient
      .put<Genre>(`/admin/genres/${id}`, genre);
  }

  deleteGenre(id: number): Observable<void> {
    return this.apiClient.delete<void>(`/admin/genres/${id}`);
  }

  getAllGenres(): Observable<Genre[]> {
    return this.apiClient
      .get<Genre[]>("/admin/genres");
  }

  // Reports
  getBooksByCategoryReport(): Observable<any> {
    return this.apiClient.get<any>('/admin/reports/books-by-category');
  }

  getDailyActivityReport(): Observable<any> {
    // Get data for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return this.apiClient.get<any>(`/admin/reports/daily-activity?startDate=${startDateStr}&endDate=${endDateStr}`);
  }

  getUserEngagementReport(): Observable<any> {
    return this.apiClient.get<any>('/admin/reports/user-engagement');
  }

  // Popularity statistics
  getPopularityStatistics(): Observable<PopularityStatistics[]> {
    return this.apiClient.get<PopularityStatistics[]>(
      "/admin/popularity/statistics"
    );
  }

  exportPopularityStatistics(format: "csv" | "pdf"): Observable<Blob> {
    return this.apiClient.getBlob(`/admin/popularity/export?format=${format}`);
  }

  // Export reports
  exportReport(reportType: string, format: "pdf" | "excel"): Observable<Blob> {
    // Map frontend report types to backend endpoints
    const endpointMap: { [key: string]: string } = {
      "books-by-category": "/admin/reports/books-by-category/export",
      "daily-activity": "/admin/reports/daily-activity/export",
      "user-engagement": "/admin/reports/user-engagement/export",
    };

    const endpoint = endpointMap[reportType];
    if (!endpoint) {
      // Fallback to mock for unknown report types
      const mockContent = `Mock ${reportType} report in ${format} format`;
      const blob = new Blob([mockContent], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      return of(blob);
    }

    // For daily-activity report, we need to provide date parameters
    if (reportType === "daily-activity") {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30); // Last 30 days

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      return this.apiClient.getBlob(
        `${endpoint}?format=${format}&startDate=${startDateStr}&endDate=${endDateStr}`
      );
    }

    // For other reports, just pass the format parameter
    return this.apiClient.getBlob(`${endpoint}?format=${format}`);
  }
}
