import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore, LoginRequest } from '../../../services/auth-store';
import { ErrorHandler } from '../../../services/error-handler';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '/';

  constructor(
    private formBuilder: FormBuilder,
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private ErrorHandler: ErrorHandler
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

      this.authStore.login(loginRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.ErrorHandler.showSuccess('Login successful!');
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
            this.errorMessage = this.ErrorHandler.handleHttpError(error);
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
