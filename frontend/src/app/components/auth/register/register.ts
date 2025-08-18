import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthStore, RegisterRequest } from '../../../services/auth-store';

@Component({
    selector: 'app-register',
    imports: [ReactiveFormsModule, RouterModule],
    template: `
    <div class="container-fluid">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div class="card shadow-sm">
            <div class="card-header text-center">
              <div class="mb-2">
                <i class="fas fa-user-plus fa-2x text-primary"></i>
              </div>
              <h4 class="mb-0">Create Your Account</h4>
            </div>
            <div class="card-body">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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
                    placeholder="Choose a username"
                    autocomplete="username"
                    >
                    @if (isFieldInvalid('username')) {
                      <div class="invalid-feedback">
                        @if (registerForm.get('username')?.errors?.['required']) {
                          <div>
                            Username is required
                          </div>
                        }
                        @if (registerForm.get('username')?.errors?.['minlength']) {
                          <div>
                            Username must be at least 3 characters long
                          </div>
                        }
                        @if (registerForm.get('username')?.errors?.['maxlength']) {
                          <div>
                            Username cannot exceed 50 characters
                          </div>
                        }
                        @if (registerForm.get('username')?.errors?.['pattern']) {
                          <div>
                            Username can only contain letters, numbers, and underscores
                          </div>
                        }
                      </div>
                    }
                  </div>
    
                  <div class="mb-3">
                    <label for="email" class="form-label">
                      <i class="fas fa-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      class="form-control form-control-lg"
                      formControlName="email"
                      [class.is-invalid]="isFieldInvalid('email')"
                      placeholder="Enter your email address"
                      autocomplete="email"
                      >
                      @if (isFieldInvalid('email')) {
                        <div class="invalid-feedback">
                          @if (registerForm.get('email')?.errors?.['required']) {
                            <div>
                              Email is required
                            </div>
                          }
                          @if (registerForm.get('email')?.errors?.['email']) {
                            <div>
                              Please enter a valid email address
                            </div>
                          }
                          @if (registerForm.get('email')?.errors?.['maxlength']) {
                            <div>
                              Email cannot exceed 100 characters
                            </div>
                          }
                        </div>
                      }
                    </div>
    
                    <div class="mb-3">
                      <label for="password" class="form-label">
                        <i class="fas fa-lock me-2"></i>Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        class="form-control form-control-lg"
                        formControlName="password"
                        [class.is-invalid]="isFieldInvalid('password')"
                        placeholder="Create a password"
                        autocomplete="new-password"
                        >
                        @if (isFieldInvalid('password')) {
                          <div class="invalid-feedback">
                            @if (registerForm.get('password')?.errors?.['required']) {
                              <div>
                                Password is required
                              </div>
                            }
                            @if (registerForm.get('password')?.errors?.['minlength']) {
                              <div>
                                Password must be at least 6 characters long
                              </div>
                            }
                            @if (registerForm.get('password')?.errors?.['pattern']) {
                              <div>
                                Password must contain at least one letter and one number
                              </div>
                            }
                          </div>
                        }
                        <div class="form-text">
                          <i class="fas fa-info-circle me-1"></i>
                          Password must be at least 6 characters long and contain at least one letter and one number.
                        </div>
                      </div>
    
                      <div class="mb-4">
                        <label for="confirmPassword" class="form-label">
                          <i class="fas fa-lock me-2"></i>Confirm Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          class="form-control form-control-lg"
                          formControlName="confirmPassword"
                          [class.is-invalid]="isFieldInvalid('confirmPassword')"
                          placeholder="Confirm your password"
                          autocomplete="new-password"
                          >
                          @if (isFieldInvalid('confirmPassword')) {
                            <div class="invalid-feedback">
                              @if (registerForm.get('confirmPassword')?.errors?.['required']) {
                                <div>
                                  Please confirm your password
                                </div>
                              }
                              @if (registerForm.get('confirmPassword')?.errors?.['passwordMismatch']) {
                                <div>
                                  Passwords do not match
                                </div>
                              }
                            </div>
                          }
                        </div>
    
                        @if (errorMessage) {
                          <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            {{ errorMessage }}
                          </div>
                        }
    
                        @if (successMessage) {
                          <div class="alert alert-success">
                            <i class="fas fa-check-circle me-2"></i>
                            {{ successMessage }}
                          </div>
                        }
    
                        <div class="d-grid gap-2 mb-4">
                          <button
                            type="submit"
                            class="btn btn-primary btn-lg"
                            [disabled]="registerForm.invalid || isLoading"
                            >
                            @if (isLoading) {
                              <span class="spinner-border spinner-border-sm me-2"></span>
                            }
                            @if (!isLoading) {
                              <i class="fas fa-user-plus me-2"></i>
                            }
                            {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                          </button>
                        </div>
                      </form>
    
                      <div class="text-center">
                        <div class="border-top pt-3">
                          <p class="mb-0 text-muted">
                            Already have an account?
                          </p>
                          <a routerLink="/login" class="btn btn-outline-primary btn-sm mt-2">
                            <i class="fas fa-sign-in-alt me-2"></i>Sign In
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
      padding: 2rem 1rem;
      justify-content:center;
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
      background: linear-gradient(135deg, #28a745, #20c997);
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
      border-color: #28a745;
      box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }
    
    .btn-lg {
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
      border-radius: 0.5rem;
      font-weight: 600;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #28a745, #20c997);
      border: none;
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, #218838, #1e7e34);
      transform: translateY(-1px);
    }
    
    .btn-outline-primary {
      border: 2px solid #28a745;
      color: #28a745;
      font-weight: 600;
    }
    
    .btn-outline-primary:hover {
      background-color: #28a745;
      border-color: #28a745;
      transform: translateY(-1px);
    }
    
    .alert-danger {
      border-radius: 0.5rem;
      border: none;
      background-color: #f8d7da;
      color: #721c24;
    }
    
    .alert-success {
      border-radius: 0.5rem;
      border: none;
      background-color: #d1edff;
      color: #0c5460;
    }
    
    .form-text {
      font-size: 0.875em;
      color: #6c757d;
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
      
      .form-text {
        font-size: 0.8rem;
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authStore: AuthStore,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Remove the passwordMismatch error if passwords match
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registerRequest: RegisterRequest = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authStore.register(registerRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = 'Account created successfully! You can now log in.';
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Registration failed. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 409) {
            this.errorMessage = 'Username or email already exists.';
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
