import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';

interface ReportData {
  booksByCategory?: { category: string; count: number }[];
  dailyActivity?: { date: string; users: number; books: number; reviews: number }[];
  userEngagement?: { metric: string; value: number }[];
}

@Component({
    selector: 'app-reports-panel',
    imports: [CommonModule],
    template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <h1 class="h3 mb-4">Reports & Analytics</h1>
        </div>
      </div>

      <!-- Report Cards -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-pie me-2"></i>Books by Category
              </h5>
            </div>
            <div class="card-body">
              <p class="card-text">View distribution of books across different genres and categories.</p>
              <div class="d-grid gap-2">
                <button 
                  class="btn btn-outline-primary"
                  (click)="loadReport('books-by-category')"
                  [disabled]="loadingReports['books-by-category']"
                >
                  <span *ngIf="loadingReports['books-by-category']" class="spinner-border spinner-border-sm me-2"></span>
                  Generate Report
                </button>
                <div class="btn-group" *ngIf="reportData.booksByCategory">
                  <button 
                    class="btn btn-sm btn-success"
                    (click)="exportReport('books-by-category', 'pdf')"
                    [disabled]="exporting"
                  >
                    <i class="fas fa-file-pdf me-1"></i>PDF
                  </button>
                  <button 
                    class="btn btn-sm btn-success"
                    (click)="exportReport('books-by-category', 'excel')"
                    [disabled]="exporting"
                  >
                    <i class="fas fa-file-excel me-1"></i>Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-header bg-info text-white">
              <h5 class="card-title mb-0">
                <i class="fas fa-chart-line me-2"></i>Daily Activity
              </h5>
            </div>
            <div class="card-body">
              <p class="card-text">Track daily user registrations, book additions, and review activity.</p>
              <div class="d-grid gap-2">
                <button 
                  class="btn btn-outline-info"
                  (click)="loadReport('daily-activity')"
                  [disabled]="loadingReports['daily-activity']"
                >
                  <span *ngIf="loadingReports['daily-activity']" class="spinner-border spinner-border-sm me-2"></span>
                  Generate Report
                </button>
                <div class="btn-group" *ngIf="reportData.dailyActivity">
                  <button 
                    class="btn btn-sm btn-success"
                    (click)="exportReport('daily-activity', 'pdf')"
                    [disabled]="exporting"
                  >
                    <i class="fas fa-file-pdf me-1"></i>PDF
                  </button>
                  <button 
                    class="btn btn-sm btn-success"
                    (click)="exportReport('daily-activity', 'excel')"
                    [disabled]="exporting"
                  >
                    <i class="fas fa-file-excel me-1"></i>Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-header bg-warning text-dark">
              <h5 class="card-title mb-0">
                <i class="fas fa-users me-2"></i>User Engagement
              </h5>
            </div>
            <div class="card-body">
              <p class="card-text">Analyze user engagement metrics and reading statistics.</p>
              <div class="d-grid gap-2">
                <button 
                  class="btn btn-outline-warning"
                  (click)="loadReport('user-engagement')"
                  [disabled]="loadingReports['user-engagement']"
                >
                  <span *ngIf="loadingReports['user-engagement']" class="spinner-border spinner-border-sm me-2"></span>
                  Generate Report
                </button>
                <div class="btn-group" *ngIf="reportData.userEngagement">
                  <button 
                    class="btn btn-sm btn-success"
                    (click)="exportReport('user-engagement', 'pdf')"
                    [disabled]="exporting"
                  >
                    <i class="fas fa-file-pdf me-1"></i>PDF
                  </button>
                  <button 
                    class="btn btn-sm btn-success"
                    (click)="exportReport('user-engagement', 'excel')"
                    [disabled]="exporting"
                  >
                    <i class="fas fa-file-excel me-1"></i>Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Books by Category Report -->
      <div class="row mb-4" *ngIf="reportData.booksByCategory">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Books by Category Distribution</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Number of Books</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of reportData.booksByCategory">
                      <td>{{ item.category }}</td>
                      <td>{{ item.count }}</td>
                      <td>{{ getPercentage(item.count, getTotalBooks()) }}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- Simple Bar Chart -->
              <div class="mt-4">
                <h6>Visual Distribution</h6>
                <div *ngFor="let item of reportData.booksByCategory" class="mb-2">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <small>{{ item.category }}</small>
                    <small>{{ item.count }} books</small>
                  </div>
                  <div class="progress" style="height: 20px;">
                    <div 
                      class="progress-bar bg-primary" 
                      [style.width.%]="getPercentage(item.count, getTotalBooks())"
                    >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Activity Report -->
      <div class="row mb-4" *ngIf="reportData.dailyActivity">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Daily Activity Report (Last 30 Days)</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>New Users</th>
                      <th>Books Added</th>
                      <th>Reviews Posted</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of reportData.dailyActivity">
                      <td>{{ formatDate(item.date) }}</td>
                      <td>
                        <span class="badge bg-primary">{{ item.users }}</span>
                      </td>
                      <td>
                        <span class="badge bg-success">{{ item.books }}</span>
                      </td>
                      <td>
                        <span class="badge bg-info">{{ item.reviews }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Engagement Report -->
      <div class="row mb-4" *ngIf="reportData.userEngagement">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">User Engagement Metrics</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6 col-lg-3 mb-3" *ngFor="let metric of reportData.userEngagement">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <h3 class="text-primary">{{ metric.value }}</h3>
                      <p class="card-text">{{ metric.metric }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div class="row" *ngIf="error">
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error Loading Reports</h4>
            <p>{{ error }}</p>
            <hr>
            <button class="btn btn-outline-danger" (click)="clearError()">
              <i class="fas fa-times me-2"></i>Dismiss
            </button>
          </div>
        </div>
      </div>

      <!-- Export Status -->
      <div class="position-fixed top-0 end-0 p-3" style="z-index: 1050">
        <div 
          class="alert alert-success alert-dismissible fade show" 
          role="alert"
          *ngIf="exportSuccess"
        >
          Report exported successfully!
          <button 
            type="button" 
            class="btn-close" 
            (click)="exportSuccess = false"
          ></button>
        </div>
      </div>
    </div>
  `
})
export class ReportsPanelComponent implements OnInit {
  reportData: ReportData = {};
  loadingReports: { [key: string]: boolean } = {};
  exporting = false;
  exportSuccess = false;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    // Component initialized
  }

  loadReport(reportType: string): void {
    this.loadingReports[reportType] = true;
    this.error = null;

    let reportObservable;
    
    switch (reportType) {
      case 'books-by-category':
        reportObservable = this.adminService.getBooksByCategoryReport();
        break;
      case 'daily-activity':
        reportObservable = this.adminService.getDailyActivityReport();
        break;
      case 'user-engagement':
        reportObservable = this.adminService.getUserEngagementReport();
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

    this.adminService.exportReport(reportType, format).subscribe({
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