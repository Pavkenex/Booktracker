import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../../../services/auth.service';
import { ErrorService } from '../../../services/error.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-header">
            <h4 class="text-center mb-0">Login to BookTracker</h4>
          </div>
          <div class="card-body">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  class="form-control"
                  formControlName="username"
                  [class.is-invalid]="isFieldInvalid('username')"
                  placeholder="Enter your username"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('username')">
                  <div *ngIf="loginForm.get('username')?.errors?.['required']">
                    Username is required
                  </div>
                  <div *ngIf="loginForm.get('username')?.errors?.['minlength']">
                    Username must be at least 3 characters long
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  class="form-control"
                  formControlName="password"
                  [class.is-invalid]="isFieldInvalid('password')"
                  placeholder="Enter your password"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('password')">
                  <div *ngIf="loginForm.get('password')?.errors?.['required']">
                    Password is required
                  </div>
                  <div *ngIf="loginForm.get('password')?.errors?.['minlength']">
                    Password must be at least 6 characters long
                  </div>
                </div>
              </div>

              <div class="alert alert-danger" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>

              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="loginForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Logging in...' : 'Login' }}
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <p class="mb-2">
                <a routerLink="/forgot-password" class="text-decoration-none">
                  Forgot your password?
                </a>
              </p>
              <p class="mb-0">
                Don't have an account? 
                <a routerLink="/register" class="text-decoration-none">Sign up</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
      border: 1px solid rgba(0, 0, 0, 0.125);
    }
    
    .card-header {
      background-color: #f8f9fa;
      border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    }
    
    .form-control:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    }
    
    .btn-primary {
      background-color: #0d6efd;
      border-color: #0d6efd;
    }
    
    .btn-primary:hover {
      background-color: #0b5ed7;
      border-color: #0a58ca;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private errorService: ErrorService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        usernameOrEmail: this.loginForm.value.username,
        password: this.loginForm.value.password
      };

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.errorService.showSuccess('Login successful!');
            this.router.navigate([this.returnUrl]);
          } else {
            this.errorMessage = response.message || 'Login failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password.';
          } else {
            // Let the error interceptor handle other errors
            this.errorMessage = this.errorService.handleHttpError(error);
          }
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}