import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ErrorService, ErrorMessage } from '../../../services/error.service';

@Component({
  selector: 'app-toast-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
      <div 
        *ngFor="let error of errors" 
        class="toast show"
        [ngClass]="getToastClass(error.type)"
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
      >
        <div class="toast-header">
          <i class="me-2" [ngClass]="getIconClass(error.type)"></i>
          <strong class="me-auto">{{ getTitle(error.type) }}</strong>
          <small class="text-muted">{{ getTimeAgo(error.timestamp) }}</small>
          <button 
            type="button" 
            class="btn-close" 
            (click)="removeError(error.id)"
            aria-label="Close"
          ></button>
        </div>
        <div class="toast-body">
          {{ error.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      max-width: 400px;
    }
    
    .toast {
      margin-bottom: 0.5rem;
      min-width: 300px;
    }
    
    .toast-error {
      border-left: 4px solid #dc3545;
    }
    
    .toast-warning {
      border-left: 4px solid #ffc107;
    }
    
    .toast-info {
      border-left: 4px solid #0dcaf0;
    }
    
    .toast-success {
      border-left: 4px solid #198754;
    }
  `]
})
export class ToastNotificationsComponent implements OnInit, OnDestroy {
  errors: ErrorMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private errorService: ErrorService) {}

  ngOnInit(): void {
    this.subscription = this.errorService.errors$.subscribe(
      errors => this.errors = errors
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeError(id: string): void {
    this.errorService.removeError(id);
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