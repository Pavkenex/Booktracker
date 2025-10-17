import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from '@angular/router';
import {
  AdminApi,
  PopularityStatistics,
} from '../../../services/admin-api';

@Component({
    selector: "app-popularity-statistics",
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: "./popularity-statistics.html",
    styleUrls: ["./popularity-statistics.css"]
})
export class PopularityStatisticsComponent implements OnInit {
  statistics: PopularityStatistics[] = [];
  filteredStatistics: PopularityStatistics[] = [];
  loading = true;
  error: string | null = null;

  
  searchTerm = "";
  sortBy = "viewCount";
  displayLimit = "25";

  
  exportStatus = {
    show: false,
    message: "",
  };

  constructor(private adminApi: AdminApi) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.adminApi.getPopularityStatistics().subscribe({
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

    
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    
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

    this.adminApi.exportPopularityStatistics(format).subscribe({
      next: (blob) => {
        
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

  private showExportStatus(message: string): void {
    this.exportStatus.message = message;
    this.exportStatus.show = true;
  }

  private hideExportStatus(): void {
    this.exportStatus.show = false;
  }
}
