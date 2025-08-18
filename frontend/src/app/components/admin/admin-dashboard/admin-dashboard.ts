import { Component, OnInit } from "@angular/core";

import { RouterModule } from "@angular/router";
import { AdminService, AdminStats } from "../../../services/admin.service";

@Component({
    selector: "app-admin-dashboard",
    imports: [RouterModule],
    template: `
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4"
            >
            <h1 class="h3 mb-2 mb-md-0">
              <i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard
            </h1>
            <div class="d-flex gap-2">
              <button
                class="btn btn-outline-secondary btn-sm"
                (click)="loadStats()"
                >
                <i class="fas fa-sync-alt me-1"></i>
                <span class="d-none d-sm-inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Stats Cards -->
      @if (stats) {
        <div class="row g-3 mb-4">
          <div class="col-6 col-lg-3">
            <div class="card bg-primary text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="card-title mb-1">{{ stats.totalUsers }}</h4>
                    <p class="card-text small mb-0">Total Users</p>
                  </div>
                  <div class="d-none d-sm-block">
                    <i class="fas fa-users fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card bg-success text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="card-title mb-1">{{ stats.totalBooks }}</h4>
                    <p class="card-text small mb-0">Total Books</p>
                  </div>
                  <div class="d-none d-sm-block">
                    <i class="fas fa-book fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card bg-info text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="card-title mb-1">{{ stats.totalGenres }}</h4>
                    <p class="card-text small mb-0">Total Genres</p>
                  </div>
                  <div class="d-none d-sm-block">
                    <i class="fas fa-tags fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card bg-warning text-white h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h4 class="card-title mb-1">
                      {{ stats.recentActivity.newUsers }}
                    </h4>
                    <p class="card-text small mb-0">
                      <span class="d-none d-md-inline">New Users (7 days)</span>
                      <span class="d-inline d-md-none">New Users</span>
                    </p>
                  </div>
                  <div class="d-none d-sm-block">
                    <i class="fas fa-user-plus fa-2x opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    
      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="fas fa-bolt me-2"></i>Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="d-grid">
                    <button
                      class="btn btn-outline-primary btn-lg"
                      routerLink="/admin/books"
                      >
                      <i class="fas fa-book me-2"></i>
                      <span class="d-none d-sm-inline">Manage </span>Books
                    </button>
                  </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="d-grid">
                    <button
                      class="btn btn-outline-success btn-lg"
                      routerLink="/admin/genres"
                      >
                      <i class="fas fa-tags me-2"></i>
                      <span class="d-none d-sm-inline">Manage </span>Genres
                    </button>
                  </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="d-grid">
                    <button
                      class="btn btn-outline-warning btn-lg"
                      routerLink="/admin/popularity"
                      >
                      <i class="fas fa-chart-line me-2"></i>
                      <span class="d-none d-sm-inline">Book </span>Popularity
                    </button>
                  </div>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <div class="d-grid">
                    <button
                      class="btn btn-outline-info btn-lg"
                      routerLink="/admin/reports"
                      >
                      <i class="fas fa-chart-bar me-2"></i>
                      <span class="d-none d-sm-inline">View </span>Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <!-- Recent Activity -->
      @if (stats) {
        <div class="row g-3">
          <div class="col-12 col-lg-6">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="fas fa-clock me-2"></i>
                  <span class="d-none d-sm-inline"
                    >Recent Activity (Last 7 Days)</span
                    >
                    <span class="d-inline d-sm-none">Recent Activity</span>
                  </h5>
                </div>
                <div class="card-body">
                  <div class="row text-center g-2">
                    <div class="col-4">
                      <div class="border-end border-2">
                        <h4 class="text-primary mb-1">
                          {{ stats.recentActivity.newUsers }}
                        </h4>
                        <small class="text-muted">
                          <span class="d-none d-md-inline">New Users</span>
                          <span class="d-inline d-md-none">Users</span>
                        </small>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="border-end border-2">
                        <h4 class="text-success mb-1">
                          {{ stats.recentActivity.booksAdded }}
                        </h4>
                        <small class="text-muted">
                          <span class="d-none d-md-inline">Books Added</span>
                          <span class="d-inline d-md-none">Books</span>
                        </small>
                      </div>
                    </div>
                    <div class="col-4">
                      <h4 class="text-info mb-1">
                        {{ stats.recentActivity.reviewsPosted }}
                      </h4>
                      <small class="text-muted">
                        <span class="d-none d-md-inline">Reviews Posted</span>
                        <span class="d-inline d-md-none">Reviews</span>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-6">
              <div class="card h-100">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-server me-2"></i>System Status
                  </h5>
                </div>
                <div class="card-body">
                  <div class="d-flex align-items-center mb-3">
                    <div class="flex-shrink-0">
                      <div class="bg-success rounded-circle status-indicator"></div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="fw-bold">Database</div>
                      <small class="text-muted">Connected and operational</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center mb-3">
                    <div class="flex-shrink-0">
                      <div class="bg-success rounded-circle status-indicator"></div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="fw-bold">API Services</div>
                      <small class="text-muted">All services running</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center">
                    <div class="flex-shrink-0">
                      <div class="bg-success rounded-circle status-indicator"></div>
                    </div>
                    <div class="flex-grow-1 ms-3">
                      <div class="fw-bold">Authentication</div>
                      <small class="text-muted">JWT tokens active</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
    
        <!-- Loading State -->
        @if (loading) {
          <div class="row">
            <div class="col-12 text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">Loading dashboard data...</p>
            </div>
          </div>
        }
    
        <!-- Error State -->
        @if (error) {
          <div class="row">
            <div class="col-12">
              <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error Loading Dashboard</h4>
                <p>{{ error }}</p>
                <hr />
                <button class="btn btn-outline-danger" (click)="loadStats()">
                  <i class="fas fa-redo me-2"></i>Try Again
                </button>
              </div>
            </div>
          </div>
        }
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

      .btn-lg {
        padding: 0.75rem 1rem;
        font-size: 1rem;
        border-radius: 0.5rem;
        font-weight: 500;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
      }

      .opacity-75 {
        opacity: 0.75;
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

        .card-title {
          font-size: 1.25rem;
        }

        .btn-lg {
          padding: 0.75rem 0.5rem;
          font-size: 0.9rem;
        }
      }

      @media (max-width: 575.98px) {
        .container-fluid {
          padding: 0.5rem;
        }

        .card-body {
          padding: 0.75rem 0.5rem;
        }

        .card-title {
          font-size: 1.1rem;
        }

        .btn-lg {
          padding: 0.625rem 0.5rem;
          font-size: 0.85rem;
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

      /* Card hover effects for non-touch devices */
      @media (hover: hover) and (pointer: fine) {
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
      }
    `,
    ]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getAdminStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        this.error = "Failed to load dashboard statistics. Please try again.";
        this.loading = false;
        console.error("Error loading admin stats:", error);
      },
    });
  }
}
