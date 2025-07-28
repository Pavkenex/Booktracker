import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card">
          <div class="card-header">
            <h4 class="text-center mb-0">Create Your Account</h4>
          </div>
          <div class="card-body">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  class="form-control"
                  formControlName="username"
                  [class.is-invalid]="isFieldInvalid('username')"
                  placeholder="Choose a username"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('username')">
                  <div *ngIf="registerForm.get('username')?.errors?.['required']">
                    Username is required
                  </div>
                  <div *ngIf="registerForm.get('username')?.errors?.['minlength']">
                    Username must be at least 3 characters long
                  </div>
                  <div *ngIf="registerForm.get('username')?.errors?.['maxlength']">
                    Username cannot exceed 50 characters
                  </div>
                  <div *ngIf="registerForm.get('username')?.errors?.['pattern']">
                    Username can only contain letters, numbers, and underscores
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  class="form-control"
                  formControlName="email"
                  [class.is-invalid]="isFieldInvalid('email')"
                  placeholder="Enter your email address"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                  <div *ngIf="registerForm.get('email')?.errors?.['required']">
                    Email is required
                  </div>
                  <div *ngIf="registerForm.get('email')?.errors?.['email']">
                    Please enter a valid email address
                  </div>
                  <div *ngIf="registerForm.get('email')?.errors?.['maxlength']">
                    Email cannot exceed 100 characters
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
                  placeholder="Create a password"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('password')">
                  <div *ngIf="registerForm.get('password')?.errors?.['required']">
                    Password is required
                  </div>
                  <div *ngIf="registerForm.get('password')?.errors?.['minlength']">
                    Password must be at least 6 characters long
                  </div>
                  <div *ngIf="registerForm.get('password')?.errors?.['pattern']">
                    Password must contain at least one letter and one number
                  </div>
                </div>
                <div class="form-text">
                  Password must be at least 6 characters long and contain at least one letter and one number.
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  class="form-control"
                  formControlName="confirmPassword"
                  [class.is-invalid]="isFieldInvalid('confirmPassword')"
                  placeholder="Confirm your password"
                >
                <div class="invalid-feedback" *ngIf="isFieldInvalid('confirmPassword')">
                  <div *ngIf="registerForm.get('confirmPassword')?.errors?.['required']">
                    Please confirm your password
                  </div>
                  <div *ngIf="registerForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                    Passwords do not match
                  </div>
                </div>
              </div>

              <div class="alert alert-danger" *ngIf="errorMessage">
                {{ errorMessage }}
              </div>

              <div class="alert alert-success" *ngIf="successMessage">
                {{ successMessage }}
              </div>

              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="registerForm.invalid || isLoading"
                >
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <p class="mb-0">
                Already have an account? 
                <a routerLink="/login" class="text-decoration-none">Sign in</a>
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
    
    .form-text {
      font-size: 0.875em;
      color: #6c757d;
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
    private authService: AuthService,
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

      this.authService.register(registerRequest).subscribe({
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