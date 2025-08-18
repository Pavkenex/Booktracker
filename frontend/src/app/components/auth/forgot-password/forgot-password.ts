import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthStore, PasswordResetRequest } from '../../../services/auth-store';

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, RouterModule],
    template: `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-header">
            <h4 class="text-center mb-0">Reset Password</h4>
          </div>
          <div class="card-body">
            @if (!emailSent) {
              <div>
                <p class="text-muted mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
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
                      @if (isFieldInvalid('email')) {
                        <div class="invalid-feedback">
                          @if (forgotPasswordForm.get('email')?.errors?.['required']) {
                            <div>
                              Email is required
                            </div>
                          }
                          @if (forgotPasswordForm.get('email')?.errors?.['email']) {
                            <div>
                              Please enter a valid email address
                            </div>
                          }
                        </div>
                      }
                    </div>
                    @if (errorMessage) {
                      <div class="alert alert-danger">
                        {{ errorMessage }}
                      </div>
                    }
                    <div class="d-grid gap-2">
                      <button
                        type="submit"
                        class="btn btn-primary"
                        [disabled]="forgotPasswordForm.invalid || isLoading"
                        >
                        @if (isLoading) {
                          <span class="spinner-border spinner-border-sm me-2"></span>
                        }
                        {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
                      </button>
                    </div>
                  </form>
                </div>
              }
    
              @if (emailSent) {
                <div class="text-center">
                  <div class="alert alert-success">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    Password reset link has been sent to your email address.
                  </div>
                  <p class="text-muted mb-4">
                    Please check your email and follow the instructions to reset your password.
                  </p>
                  <p class="text-muted small">
                    Didn't receive the email? Check your spam folder or
                    <button
                      type="button"
                      class="btn btn-link p-0 text-decoration-none"
                      (click)="resendEmail()"
                      [disabled]="isLoading"
                      >
                      try again
                    </button>.
                  </p>
                </div>
              }
    
              <div class="text-center mt-3">
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
    
    .btn-link {
      color: #0d6efd;
      font-size: inherit;
    }
    
    .btn-link:hover {
      color: #0b5ed7;
    }
  `]
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  emailSent = false;

  constructor(
    private formBuilder: FormBuilder,
    private authStore: AuthStore
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.sendResetEmail();
    }
  }

  resendEmail(): void {
    this.sendResetEmail();
  }

  private sendResetEmail(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const resetRequest: PasswordResetRequest = {
      email: this.forgotPasswordForm.value.email
    };

    this.authStore.requestPasswordReset(resetRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.emailSent = true;
        } else {
          this.errorMessage = response.message || 'Failed to send reset email. Please try again.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = 'No account found with this email address.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'An error occurred. Please try again.';
        }
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
