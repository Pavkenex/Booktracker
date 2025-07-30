import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '../services/error.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private errorService: ErrorService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Don't show error messages for certain endpoints that handle their own errors
        const skipErrorHandling = this.shouldSkipErrorHandling(req.url, error.status);
        
        if (!skipErrorHandling) {
          this.handleError(error);
        }

        return throwError(() => error);
      })
    );
  }

  private shouldSkipErrorHandling(url: string, status: number): boolean {
    // Skip error handling for login attempts (let the component handle it)
    if (url.includes('/auth/login') && status === 401) {
      return true;
    }
    
    // Skip error handling for registration validation errors (let the component handle it)
    if (url.includes('/auth/register') && status === 400) {
      return true;
    }

    // Skip error handling for password reset requests
    if (url.includes('/auth/forgot-password') && status === 404) {
      return true;
    }

    return false;
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.errors) {
        // Handle validation errors
        this.errorService.handleValidationErrors(error.error.errors);
        return;
      } else {
        errorMessage = this.errorService.handleHttpError(error);
      }
    }

    // Show the error message
    this.errorService.showError(errorMessage);

    // Log the error for debugging
    console.error('HTTP Error:', error);
  }
}