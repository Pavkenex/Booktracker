import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, AdminStats } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <h1 class="h3 mb-4">Admin Dashboard</h1>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4" *ngIf="stats">
        <div class="col-md-3 mb-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">{{ stats.totalUsers }}</h4>
                  <p class="card-text">Total Users</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">{{ stats.totalBooks }}</h4>
                  <p class="card-text">Total Books</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-book fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">{{ stats.totalGenres }}</h4>
                  <p class="card-text">Total Genres</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-tags fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h4 class="card-title">{{ stats.recentActivity.newUsers }}</h4>
                  <p class="card-text">New Users (7 days)</p>
                </div>
                <div class="align-self-center">
                  <i class="fas fa-user-plus fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <div class="d-grid">
                    <button 
                      class="btn btn-outline-primary btn-lg"
                      routerLink="/admin/books"
                    >
                      <i class="fas fa-book me-2"></i>
                      Manage Books
                    </button>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="d-grid">
                    <button 
                      class="btn btn-outline-success btn-lg"
                      routerLink="/admin/genres"
                    >
                      <i class="fas fa-tags me-2"></i>
                      Manage Genres
                    </button>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="d-grid">
                    <button 
                      class="btn btn-outline-info btn-lg"
                      routerLink="/admin/reports"
                    >
                      <i class="fas fa-chart-bar me-2"></i>
                      View Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="row" *ngIf="stats">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Recent Activity (Last 7 Days)</h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-4">
                  <div class="border-end">
                    <h4 class="text-primary">{{ stats.recentActivity.newUsers }}</h4>
                    <small class="text-muted">New Users</small>
                  </div>
                </div>
                <div class="col-4">
                  <div class="border-end">
                    <h4 class="text-success">{{ stats.recentActivity.booksAdded }}</h4>
                    <small class="text-muted">Books Added</small>
                  </div>
                </div>
                <div class="col-4">
                  <h4 class="text-info">{{ stats.recentActivity.reviewsPosted }}</h4>
                  <small class="text-muted">Reviews Posted</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">System Status</h5>
            </div>
            <div class="card-body">
              <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0">
                  <div class="bg-success rounded-circle" style="width: 12px; height: 12px;"></div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="fw-bold">Database</div>
                  <small class="text-muted">Connected and operational</small>
                </div>
              </div>
              <div class="d-flex align-items-center mb-3">
                <div class="flex-shrink-0">
                  <div class="bg-success rounded-circle" style="width: 12px; height: 12px;"></div>
                </div>
                <div class="flex-grow-1 ms-3">
                  <div class="fw-bold">API Services</div>
                  <small class="text-muted">All services running</small>
                </div>
              </div>
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0">
                  <div class="bg-success rounded-circle" style="width: 12px; height: 12px;"></div>
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

      <!-- Loading State -->
      <div class="row" *ngIf="loading">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Loading dashboard data...</p>
        </div>
      </div>

      <!-- Error State -->
      <div class="row" *ngIf="error">
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            <h4 class="alert-heading">Error Loading Dashboard</h4>
            <p>{{ error }}</p>
            <hr>
            <button class="btn btn-outline-danger" (click)="loadStats()">
              <i class="fas fa-redo me-2"></i>Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  `
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
        this.error = 'Failed to load dashboard statistics. Please try again.';
        this.loading = false;
        console.error('Error loading admin stats:', error);
      }
    });
  }
}