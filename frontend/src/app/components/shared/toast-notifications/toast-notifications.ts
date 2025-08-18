import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ErrorHandler, ErrorMessage } from '../../../services/error-handler';

@Component({
    selector: 'app-toast-notifications',
    imports: [CommonModule],
    templateUrl: './toast-notifications.html',
    styleUrls: ['./toast-notifications.css']
})
export class ToastNotificationsComponent implements OnInit, OnDestroy {
  errors: ErrorMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private ErrorHandler: ErrorHandler) {}

  ngOnInit(): void {
    this.subscription = this.ErrorHandler.errors$.subscribe(
      errors => this.errors = errors
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeError(id: string): void {
    this.ErrorHandler.removeError(id);
  }

  getToastClass(type: string): string {
    return `toast-${type}`;
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'error':
        return 'bi bi-exclamation-triangle-fill text-danger';
      case 'warning':
        return 'bi bi-exclamation-triangle-fill text-warning';
      case 'info':
        return 'bi bi-info-circle-fill text-info';
      case 'success':
        return 'bi bi-check-circle-fill text-success';
      default:
        return 'bi bi-info-circle-fill';
    }
  }

  getTitle(type: string): string {
    switch (type) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'success':
        return 'Success';
      default:
        return 'Notification';
    }
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) {
      return 'just now';
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `${hours}h ago`;
    }
  }
}
