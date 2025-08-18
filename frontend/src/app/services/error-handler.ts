import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ErrorMessage {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: Date;
  autoHide?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandler {
  private errorsSubject = new BehaviorSubject<ErrorMessage[]>([]);
  public errors$ = this.errorsSubject.asObservable();

  constructor() {}

  showError(message: string, autoHide: boolean = true): void {
    this.addMessage(message, 'error', autoHide);
  }

  showWarning(message: string, autoHide: boolean = true): void {
    this.addMessage(message, 'warning', autoHide);
  }

  showInfo(message: string, autoHide: boolean = true): void {
    this.addMessage(message, 'info', autoHide);
  }

  showSuccess(message: string, autoHide: boolean = true): void {
    this.addMessage(message, 'success', autoHide);
  }

  private addMessage(message: string, type: ErrorMessage['type'], autoHide: boolean): void {
    const errorMessage: ErrorMessage = {
      id: this.generateId(),
      message,
      type,
      timestamp: new Date(),
      autoHide
    };

    const currentErrors = this.errorsSubject.value;
    this.errorsSubject.next([...currentErrors, errorMessage]);

    if (autoHide) {
      setTimeout(() => {
        this.removeError(errorMessage.id);
      }, 5000); // Auto-hide after 5 seconds
    }
  }

  removeError(id: string): void {
    const currentErrors = this.errorsSubject.value;
    const filteredErrors = currentErrors.filter(error => error.id !== id);
    this.errorsSubject.next(filteredErrors);
  }

  clearAllErrors(): void {
    this.errorsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Handle HTTP error responses
  handleHttpError(error: any): string {
    if (error.error && error.error.message) {
      return error.error.message;
    } else if (error.error && typeof error.error === 'string') {
      return error.error;
    } else if (error.message) {
      return error.message;
    } else {
      switch (error.status) {
        case 400:
          return 'Bad request. Please check your input.';
        case 401:
          return 'You are not authorized to perform this action.';
        case 403:
          return 'Access denied.';
        case 404:
          return 'The requested resource was not found.';
        case 500:
          return 'Internal server error. Please try again later.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }
  }

  // Handle validation errors
  handleValidationErrors(errors: any): void {
    if (errors && typeof errors === 'object') {
      Object.keys(errors).forEach(field => {
        this.showError(`${field}: ${errors[field]}`);
      });
    }
  }
}
