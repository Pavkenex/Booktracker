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
    // Return mock data for now since backend endpoint might not exist
    const mockData = [
      { category: "Fiction", count: 450 },
      { category: "Non-Fiction", count: 320 },
      { category: "Science Fiction", count: 180 },
      { category: "Romance", count: 150 },
      { category: "Mystery", count: 120 },
      { category: "Biography", count: 30 },
    ];
    return of(mockData);
  }

  getDailyActivityReport(): Observable<any> {
    // Return mock data for now since backend endpoint might not exist
    const mockData = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      mockData.push({
        date: date.toISOString().split("T")[0],
        users: Math.floor(Math.random() * 10) + 1,
        books: Math.floor(Math.random() * 5) + 1,
        reviews: Math.floor(Math.random() * 15) + 1,
      });
    }
    return of(mockData);
  }

  getUserEngagementReport(): Observable<any> {
    // Return mock data for now since backend endpoint might not exist
    const mockData = [
      { metric: "Average Books per User", value: 8.3 },
      { metric: "Average Reviews per User", value: 12.7 },
      { metric: "Active Users (30 days)", value: 89 },
      { metric: "Books Read This Month", value: 234 },
    ];
    return of(mockData);
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
