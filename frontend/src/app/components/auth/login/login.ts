import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore, LoginRequest } from '../../../services/auth-store';
import { ErrorHandler } from '../../../services/error-handler';

@Component({
    selector: 'app-login',
    imports: [FormsModule, RouterModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginData = {
    username: '',
    password: ''
  };
  isLoading = false;
  errorMessage = '';
  returnUrl = '/';

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private ErrorHandler: ErrorHandler
  ) {}

  ngOnInit(): void {
    
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(loginForm: any): void {
    if (loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        usernameOrEmail: this.loginData.username,
        password: this.loginData.password
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
            
            this.errorMessage = this.ErrorHandler.handleHttpError(error);
          }
        }
      });
    }
  }

  isFieldInvalid(fieldName: string, form: any): boolean {
    const field = form.controls[fieldName];
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
