import { Component } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthStore, PasswordResetRequest } from '../../../services/auth-store';

@Component({
    selector: 'app-forgot-password',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.css']
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
