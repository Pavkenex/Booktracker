import { Component, OnInit } from '@angular/core';

import { AdminApi } from '../../../services/admin-api';

interface ReportData {
  booksByCategory?: { category: string; count: number }[];
  dailyActivity?: { date: string; users: number; books: number; reviews: number }[];
  userEngagement?: { metric: string; value: number }[];
}

@Component({
    selector: 'app-reports-panel',
    imports: [],
    templateUrl: './reports-panel.html',
    styleUrls: ['./reports-panel.css']
})
export class ReportsPanelComponent implements OnInit {
  reportData: ReportData = {};
  loadingReports: { [key: string]: boolean } = {};
  exporting = false;
  exportSuccess = false;
  error: string | null = null;

  constructor(private adminApi: AdminApi) {}

  ngOnInit(): void {
    // Component initialized
  }

  loadReport(reportType: string): void {
    this.loadingReports[reportType] = true;
    this.error = null;

    let reportObservable;
    
    switch (reportType) {
      case 'books-by-category':
        reportObservable = this.adminApi.getBooksByCategoryReport();
        break;
      case 'daily-activity':
        reportObservable = this.adminApi.getDailyActivityReport();
        break;
      case 'user-engagement':
        reportObservable = this.adminApi.getUserEngagementReport();
        break;
      default:
        this.loadingReports[reportType] = false;
        return;
    }

    reportObservable.subscribe({
      next: (data) => {
        switch (reportType) {
          case 'books-by-category':
            this.reportData.booksByCategory = data;
            break;
          case 'daily-activity':
            this.reportData.dailyActivity = data;
            break;
          case 'user-engagement':
            this.reportData.userEngagement = data;
            break;
        }
        this.loadingReports[reportType] = false;
      },
      error: (error) => {
        console.error(`Error loading ${reportType} report:`, error);
        this.error = `Failed to load ${reportType} report. Please try again.`;
        this.loadingReports[reportType] = false;
      }
    });
  }

  exportReport(reportType: string, format: 'pdf' | 'excel'): void {
    this.exporting = true;
    this.exportSuccess = false;

    this.adminApi.exportReport(reportType, format).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportType}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.exporting = false;
        this.exportSuccess = true;
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.exportSuccess = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        this.error = 'Failed to export report. Please try again.';
        this.exporting = false;
      }
    });
  }

  getTotalBooks(): number {
    if (!this.reportData.booksByCategory) return 0;
    return this.reportData.booksByCategory.reduce((total, item) => total + item.count, 0);
  }

  getPercentage(count: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  clearError(): void {
    this.error = null;
  }
}
