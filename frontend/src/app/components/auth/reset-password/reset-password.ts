import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore, PasswordResetConfirm } from '../../../services/auth-store';

@Component({
    selector: 'app-reset-password',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './reset-password.html',
    styleUrls: ['./reset-password.css']
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
    private authStore: AuthStore,
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

      this.authStore.resetPassword(resetRequest).subscribe({
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
