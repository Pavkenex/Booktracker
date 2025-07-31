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
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
          <div class="card shadow-sm">
            <div class="card-header text-center">
              <div class="mb-2">
                <i class="fas fa-book-open fa-2x text-primary"></i>
              </div>
              <h4 class="mb-0">Login to BookTracker</h4>
            </div>
            <div class="card-body">
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="username" class="form-label">
                    <i class="fas fa-user me-2"></i>Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    class="form-control form-control-lg"
                    formControlName="username"
                    [class.is-invalid]="isFieldInvalid('username')"
                    placeholder="Enter your username"
                    autocomplete="username"
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

                <div class="mb-4">
                  <label for="password" class="form-label">
                    <i class="fas fa-lock me-2"></i>Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    class="form-control form-control-lg"
                    formControlName="password"
                    [class.is-invalid]="isFieldInvalid('password')"
                    placeholder="Enter your password"
                    autocomplete="current-password"
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
                  <i class="fas fa-exclamation-triangle me-2"></i>
                  {{ errorMessage }}
                </div>

                <div class="d-grid gap-2 mb-4">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!isLoading" class="fas fa-sign-in-alt me-2"></i>
                    {{ isLoading ? 'Logging in...' : 'Login' }}
                  </button>
                </div>
              </form>

              <div class="text-center">
                <div class="mb-3">
                  <a routerLink="/forgot-password" class="text-decoration-none">
                    <i class="fas fa-question-circle me-1"></i>
                    Forgot your password?
                  </a>
                </div>
                <div class="border-top pt-3">
                  <p class="mb-0 text-muted">
                    Don't have an account?
                  </p>
                  <a routerLink="/register" class="btn btn-outline-primary btn-sm mt-2">
                    <i class="fas fa-user-plus me-2"></i>Create Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container-fluid {
    min-height: calc(100vh - 76px);
    display: flex;
    align-items: center;
    justify-content: center; /* <<< ADD THIS LINE */
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }


    /*Force the row to take up the full width of the flex container */
    .container-fluid > .row {
      width: 100%;
    }
    
    .card {
      border: none;
      border-radius: 1rem;
      box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
    }
    
    .card-header {
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border-radius: 1rem 1rem 0 0 !important;
      border-bottom: none;
      padding: 2rem 1.5rem 1.5rem;
    }
    
    .card-body {
      padding: 2rem 1.5rem;
    }
    
    .form-label {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.5rem;
    }
    
    .form-control-lg {
      border-radius: 0.5rem;
      border: 2px solid #e9ecef;
      padding: 0.75rem 1rem;
      font-size: 1rem;
    }
    
    .form-control:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
      border-radius: 0.5rem;
      font-weight: 600;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #007bff, #0056b3);
      border: none;
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, #0056b3, #004085);
      transform: translateY(-1px);
    }
    
    .btn-outline-primary {
      border: 2px solid #007bff;
      color: #007bff;
      font-weight: 600;
    }
    
    .btn-outline-primary:hover {
      background-color: #007bff;
      border-color: #007bff;
      transform: translateY(-1px);
    }
    
    .alert-danger {
      border-radius: 0.5rem;
      border: none;
      background-color: #f8d7da;
      color: #721c24;
    }
    
    /* Mobile optimizations */
    @media (max-width: 767.98px) {
      .container-fluid {
        padding: 1rem 0.75rem;
        min-height: calc(100vh - 60px);
      }
      
      .card-header {
        padding: 1.5rem 1rem 1rem;
      }
      
      .card-body {
        padding: 1.5rem 1rem;
      }
      
      .form-control-lg {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      h4 {
        font-size: 1.5rem;
      }
    }
    
    @media (max-width: 575.98px) {
      .container-fluid {
        padding: 0.5rem;
      }
      
      .card-header {
        padding: 1rem 0.75rem 0.75rem;
      }
      
      .card-body {
        padding: 1rem 0.75rem;
      }
    }
    
    /* Improve accessibility and touch targets */
    .btn {
      min-height: 48px;
      transition: all 0.2s ease-in-out;
    }
    
    .btn-sm {
      min-height: 40px;
    }
    
    a {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      text-decoration: none !important;
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