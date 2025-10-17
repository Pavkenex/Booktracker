import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandler } from '../services/error-handler';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private ErrorHandler: ErrorHandler) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        const skipErrorHandling = this.shouldSkipErrorHandling(req.url, error.status);
        
        if (!skipErrorHandling) {
          this.handleError(error);
        }

        return throwError(() => error);
      })
    );
  }

  private shouldSkipErrorHandling(url: string, status: number): boolean {
    
    if (url.includes('/auth/login') && status === 401) {
      return true;
    }
    
    
    if (url.includes('/auth/register') && status === 400) {
      return true;
    }

    if (url.includes('/auth/forgot-password') && status === 404) {
      return true;
    }

    return false;
  }

  private handleError(error: HttpErrorResponse): void {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error && error.error.errors) {
        this.ErrorHandler.handleValidationErrors(error.error.errors);
        return;
      } else {
        errorMessage = this.ErrorHandler.handleHttpError(error);
      }
    }

    this.ErrorHandler.showError(errorMessage);

    console.error('HTTP Error:', error);
  }
}
