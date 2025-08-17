import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService, PasswordResetConfirm } from '../../../services/auth.service';

@Component({
    selector: 'app-reset-password',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    template: `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-header">
            <h4 class="text-center mb-0">Reset Your Password</h4>
          </div>
          <div class="card-body">
            <div *ngIf="!passwordReset && validToken">
              <p class="text-muted mb-4">
                Enter your new password below.
              </p>
              
              <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    class="form-control"
                    formControlName="newPassword"
                    [class.is-invalid]="isFieldInvalid('newPassword')"
                    placeholder="Enter your new password"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('newPassword')">
                    <div *ngIf="resetPasswordForm.get('newPassword')?.errors?.['required']">
                      Password is required
                    </div>
                    <div *ngIf="resetPasswordForm.get('newPassword')?.errors?.['minlength']">
                      Password must be at least 6 characters long
                    </div>
                    <div *ngIf="resetPasswordForm.get('newPassword')?.errors?.['pattern']">
                      Password must contain at least one letter and one number
                    </div>
                  </div>
                  <div class="form-text">
                    Password must be at least 6 characters long and contain at least one letter and one number.
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    class="form-control"
                    formControlName="confirmPassword"
                    [class.is-invalid]="isFieldInvalid('confirmPassword')"
                    placeholder="Confirm your new password"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('confirmPassword')">
                    <div *ngIf="resetPasswordForm.get('confirmPassword')?.errors?.['required']">
                      Please confirm your password
                    </div>
                    <div *ngIf="resetPasswordForm.get('confirmPassword')?.errors?.['passwordMismatch']">
                      Passwords do not match
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
                    [disabled]="resetPasswordForm.invalid || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ isLoading ? 'Resetting...' : 'Reset Password' }}
                  </button>
                </div>
              </form>
            </div>

            <div *ngIf="passwordReset" class="text-center">
              <div class="alert alert-success">
                <i class="bi bi-check-circle-fill me-2"></i>
                Your password has been successfully reset!
              </div>
              <p class="text-muted mb-4">
                You can now log in with your new password.
              </p>
              <div class="d-grid">
                <button 
                  type="button" 
                  class="btn btn-primary"
                  (click)="goToLogin()"
                >
                  Go to Login
                </button>
              </div>
            </div>

            <div *ngIf="!validToken" class="text-center">
              <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Invalid or expired reset token
              </div>
              <p class="text-muted mb-4">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <div class="d-grid">
                <a routerLink="/forgot-password" class="btn btn-primary">
                  Request New Reset Link
                </a>
              </div>
            </div>

            <div class="text-center mt-3" *ngIf="validToken && !passwordReset">
              <p class="mb-0">
                Remember your password? 
                <a routerLink="/login" class="text-decoration-none">Back to login</a>
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
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  passwordReset = false;
  validToken = true;
  resetToken = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Get the reset token from the URL
    this.resetToken = this.route.snapshot.queryParams['token'];
    
    if (!this.resetToken) {
      this.validToken = false;
    }
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('newPassword');
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
    if (this.resetPasswordForm.valid && this.validToken) {
      this.isLoading = true;
      this.errorMessage = '';

      const resetRequest: PasswordResetConfirm = {
        token: this.resetToken,
        newPassword: this.resetPasswordForm.value.newPassword
      };

      this.authService.resetPassword(resetRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.passwordReset = true;
          } else {
            this.errorMessage = response.message || 'Failed to reset password. Please try again.';
          }
        },
        error: (error) => {
          this.isLoading = false;
          if (error.status === 400) {
            this.validToken = false;
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
        }
      });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}