import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStore } from '../services/auth-store';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authStore: AuthStore) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the auth token from the service
    const authToken = this.authStore.getToken();

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (authToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    // Handle the request and catch any authentication errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token is invalid or expired, logout the user
          this.authStore.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
