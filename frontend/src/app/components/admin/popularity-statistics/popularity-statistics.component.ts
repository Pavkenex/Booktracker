import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  AdminService,
  PopularityStatistics,
} from "../../../services/admin.service";

@Component({
  selector: "app-popularity-statistics",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4"
          >
            <h1 class="h3 mb-2 mb-md-0">
              <i class="fas fa-chart-line me-2"></i>Book Popularity Statistics
            </h1>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-secondary btn-sm"
                (click)="loadStatistics()"
              >
                <i class="fas fa-sync-alt me-1"></i>
                <span class="d-none d-sm-inline">Refresh</span>
              </button>
              <div class="dropdown">
                <button
                  class="btn btn-primary btn-sm dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="fas fa-download me-1"></i>
                  <span class="d-none d-sm-inline">Export</span>
                </button>
                <ul class="dropdown-menu">
                  <li>
                    <button class="dropdown-item" (click)="exportData('csv')">
                      <i class="fas fa-file-csv me-2"></i>Export as CSV
                    </button>
                  </li>
                  <li>
                    <button class="dropdown-item" (click)="exportData('pdf')">
                      <i class="fas fa-file-pdf me-2"></i>Export as PDF
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-md-6 col-lg-4">
                  <label for="searchInput" class="form-label"
                    >Search Books</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="searchInput"
                    placeholder="Search by title or author..."
                    [(ngModel)]="searchTerm"
                    (input)="applyFilters()"
                  />
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                  <label for="sortSelect" class="form-label">Sort By</label>
                  <select
                    class="form-select"
                    id="sortSelect"
                    [(ngModel)]="sortBy"
                    (change)="applyFilters()"
                  >
                    <option value="viewCount">View Count (High to Low)</option>
                    <option value="viewCountAsc">
                      View Count (Low to High)
                    </option>
                    <option value="title">Title (A-Z)</option>
                    <option value="titleDesc">Title (Z-A)</option>
                    <option value="author">Author (A-Z)</option>
                    <option value="authorDesc">Author (Z-A)</option>
                  </select>
                </div>
                <div class="col-12 col-md-6 col-lg-4">
                  <label for="limitSelect" class="form-label">Show</label>
                  <select
                    class="form-select"
                    id="limitSelect"
                    [(ngModel)]="displayLimit"
                    (change)="applyFilters()"
                  >
                    <option value="10">Top 10</option>
                    <option value="25">Top 25</option>
                    <option value="50">Top 50</option>
                    <option value="100">Top 100</option>
                    <option value="all">All Books</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Table -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-table me-2"></i>
                Book Popularity Rankings
                <span class="badge bg-secondary ms-2"
                  >{{ filteredStatistics.length }} books</span
                >
              </h5>
            </div>
            <div class="card-body p-0">
              <!-- Loading State -->
              <div class="text-center py-5" *ngIf="loading">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading popularity statistics...</p>
              </div>

              <!-- Error State -->
              <div class="alert alert-danger m-3" *ngIf="error" role="alert">
                <h4 class="alert-heading">Error Loading Statistics</h4>
                <p>{{ error }}</p>
                <hr />
                <button
                  class="btn btn-outline-danger"
                  (click)="loadStatistics()"
                >
                  <i class="fas fa-redo me-2"></i>Try Again
                </button>
              </div>

              <!-- Empty State -->
              <div
                class="text-center py-5"
                *ngIf="!loading && !error && filteredStatistics.length === 0"
              >
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <h4>No Statistics Available</h4>
                <p class="text-muted">
                  <span *ngIf="searchTerm"
                    >No books match your search criteria.</span
                  >
                  <span *ngIf="!searchTerm"
                    >No book view data has been recorded yet.</span
                  >
                </p>
                <button
                  class="btn btn-primary"
                  (click)="clearFilters()"
                  *ngIf="searchTerm"
                >
                  <i class="fas fa-times me-2"></i>Clear Filters
                </button>
              </div>

              <!-- Statistics Table -->
              <div
                class="table-responsive"
                *ngIf="!loading && !error && filteredStatistics.length > 0"
              >
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" class="text-center" style="width: 60px;">
                        #
                      </th>
                      <th scope="col" style="width: 80px;">Cover</th>
                      <th scope="col">Title</th>
                      <th scope="col">Author</th>
                      <th scope="col" class="text-center">Rating</th>
                      <th scope="col" class="text-center">View Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let book of filteredStatistics; let i = index">
                      <td class="text-center align-middle">
                        <span class="badge bg-primary">{{ i + 1 }}</span>
                      </td>
                      <td class="align-middle">
                        <img
                          [src]="
                            book.thumbnail ||
                            '/assets/images/book-placeholder.svg'
                          "
                          [alt]="book.title"
                          class="book-thumbnail"
                          (error)="onImageError($event)"
                        />
                      </td>
                      <td class="align-middle">
                        <div class="fw-bold">{{ book.title }}</div>
                      </td>
                      <td class="align-middle">
                        <div class="text-muted">{{ book.author }}</div>
                      </td>
                      <td class="text-center align-middle">
                        <div
                          *ngIf="book.rating"
                          class="d-flex align-items-center justify-content-center"
                        >
                          <i class="fas fa-star text-warning me-1"></i>
                          <span>{{ book.rating | number : "1.1-1" }}</span>
                        </div>
                        <span *ngIf="!book.rating" class="text-muted">N/A</span>
                      </td>
                      <td class="text-center align-middle">
                        <span class="badge bg-success fs-6">{{
                          book.viewCount | number
                        }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Status -->
      <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 1050">
        <div
          class="toast"
          [class.show]="exportStatus.show"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="toast-header">
            <i class="fas fa-download me-2 text-primary"></i>
            <strong class="me-auto">Export Status</strong>
            <button
              type="button"
              class="btn-close"
              (click)="exportStatus.show = false"
            ></button>
          </div>
          <div class="toast-body">
            {{ exportStatus.message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .container-fluid {
        padding: 1rem;
      }

      .card {
        border: none;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        border-radius: 0.5rem;
      }

      .card-header {
        background-color: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        border-radius: 0.5rem 0.5rem 0 0 !important;
      }

      .book-thumbnail {
        width: 50px;
        height: 70px;
        object-fit: cover;
        border-radius: 0.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .table th {
        border-top: none;
        font-weight: 600;
        color: #495057;
      }

      .table-hover tbody tr:hover {
        background-color: rgba(0, 123, 255, 0.05);
      }

      .badge {
        font-size: 0.75em;
      }

      .toast {
        min-width: 300px;
      }

      /* Mobile optimizations */
      @media (max-width: 767.98px) {
        .container-fluid {
          padding: 0.75rem;
        }

        .h3 {
          font-size: 1.5rem;
        }

        .card-body {
          padding: 1rem 0.75rem;
        }

        .book-thumbnail {
          width: 40px;
          height: 56px;
        }

        .table-responsive {
          font-size: 0.875rem;
        }

        .badge {
          font-size: 0.7em;
        }
      }

      @media (max-width: 575.98px) {
        .container-fluid {
          padding: 0.5rem;
        }

        .card-body {
          padding: 0.75rem 0.5rem;
        }

        .book-thumbnail {
          width: 35px;
          height: 49px;
        }

        .table-responsive {
          font-size: 0.8rem;
        }
      }

      /* Improve touch targets */
      .btn {
        min-height: 44px;
        transition: all 0.2s ease-in-out;
      }

      .btn-sm {
        min-height: 36px;
      }

      .form-control,
      .form-select {
        min-height: 44px;
      }
    `,
  ],
})
export class PopularityStatisticsComponent implements OnInit {
  statistics: PopularityStatistics[] = [];
  filteredStatistics: PopularityStatistics[] = [];
  loading = true;
  error: string | null = null;

  // Filter and sort options
  searchTerm = "";
  sortBy = "viewCount";
  displayLimit = "25";

  // Export status
  exportStatus = {
    show: false,
    message: "",
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getPopularityStatistics().subscribe({
      next: (statistics) => {
        this.statistics = statistics;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = "Failed to load popularity statistics. Please try again.";
        this.loading = false;
        console.error("Error loading popularity statistics:", error);
      },
    });
  }

  applyFilters(): void {
    let filtered = [...this.statistics];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case "viewCount":
          return b.viewCount - a.viewCount;
        case "viewCountAsc":
          return a.viewCount - b.viewCount;
        case "title":
          return a.title.localeCompare(b.title);
        case "titleDesc":
          return b.title.localeCompare(a.title);
        case "author":
          return a.author.localeCompare(b.author);
        case "authorDesc":
          return b.author.localeCompare(a.author);
        default:
          return b.viewCount - a.viewCount;
      }
    });

    // Apply display limit
    if (this.displayLimit !== "all") {
      const limit = parseInt(this.displayLimit, 10);
      filtered = filtered.slice(0, limit);
    }

    this.filteredStatistics = filtered;
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.sortBy = "viewCount";
    this.displayLimit = "25";
    this.applyFilters();
  }

  exportData(format: "csv" | "pdf"): void {
    this.showExportStatus(`Preparing ${format.toUpperCase()} export...`);

    this.adminService.exportPopularityStatistics(format).subscribe({
      next: (blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `popularity-statistics.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.showExportStatus(
          `${format.toUpperCase()} export completed successfully!`
        );
        setTimeout(() => this.hideExportStatus(), 3000);
      },
      error: (error) => {
        console.error("Export error:", error);
        this.showExportStatus(
          `Failed to export ${format.toUpperCase()}. Please try again.`
        );
        setTimeout(() => this.hideExportStatus(), 5000);
      },
    });
  }

  onImageError(event: any): void {
    event.target.src = "/assets/images/book-placeholder.svg";
  }

  private showExportStatus(message: string): void {
    this.exportStatus.message = message;
    this.exportStatus.show = true;
  }

  private hideExportStatus(): void {
    this.exportStatus.show = false;
  }
}
