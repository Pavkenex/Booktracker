import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { RouterModule } from "@angular/router";
import { APP_CONSTANTS } from "../../../constants/app.constants";
import { FallbackImageDirective } from "../../../directives/fallback-image";
import { Recommendation } from "../../../models/social.model";
import { UserBook } from "../../../models/library.model";

export type RecommendationVariant = "compact" | "detailed";

@Component({
  selector: "app-recommendation-card",
  standalone: true,
  imports: [CommonModule, RouterModule, FallbackImageDirective],
  templateUrl: "./recommendation-card.html",
  styleUrls: ["./recommendation-card.css"],
})
export class RecommendationCardComponent {
  @Input({ required: true }) recommendation!: Recommendation;
  @Input() variant: RecommendationVariant = "detailed";
  @Input() context: "received" | "sent" | "home" = "received";
  @Input() userBook?: UserBook | null;
  @Input() showLibraryActions = true;
  @Input() showDeleteAction = false;
  @Input() showMarkAsRead = false;
  @Input() disableActions = false;
  @Input() deleteButtonLabel = "Remove";

  @Output() addToLibrary = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();
  @Output() markAsRead = new EventEmitter<number>();

  readonly placeholderImage = APP_CONSTANTS.DEFAULT_BOOK_PLACEHOLDER;

  get hasInLibrary(): boolean {
    return !!this.userBook;
  }

  get libraryStatusLabel(): string | null {
    if (!this.userBook) {
      return null;
    }

    switch (this.userBook.status) {
      case "to_read":
        return "In to-read";
      case "currently_reading":
        return "Currently reading";
      case "read":
        return "Finished";
      default:
        return "In library";
    }
  }

  get canAddToLibrary(): boolean {
    return this.showLibraryActions && !this.disableActions && !this.hasInLibrary;
  }

  get canDelete(): boolean {
    return this.showDeleteAction && !this.disableActions;
  }

  get canMarkAsRead(): boolean {
    return (
      this.showMarkAsRead &&
      !this.disableActions &&
      !this.isRead
    );
  }

  get participantLabel(): string {
    const name = this.context === "sent"
      ? this.recommendation.receiver.username
      : this.recommendation.sender.username;
    const prefix = this.context === "sent" ? "To" : "From";
    return `${prefix} ${name}`;
  }

  get isRead(): boolean {
    if (this.userBook && this.userBook.status === "read") {
      return true;
    }
    return !!this.recommendation.isRead;
  }

  onAddToLibrary(): void {
    if (this.canAddToLibrary) {
      this.addToLibrary.emit(this.recommendation.book.id);
    }
  }

  onDelete(): void {
    if (this.canDelete) {
      this.delete.emit(this.recommendation.id);
    }
  }

  onMarkAsRead(): void {
    if (this.canMarkAsRead) {
      this.markAsRead.emit(this.recommendation.id);
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    }
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }
    return date.toLocaleDateString();
  }
}
