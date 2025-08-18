import { Component, OnInit } from "@angular/core";

import { RouterModule } from "@angular/router";
import { AdminApi, AdminStats } from '../../../services/admin-api';

@Component({
    selector: "app-admin-dashboard",
    imports: [RouterModule],
    templateUrl: "./admin-dashboard.html",
    styleUrls: ["./admin-dashboard.css"]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(private adminApi: AdminApi) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;
    this.error = null;

    this.adminApi.getAdminStats().subscribe({
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
