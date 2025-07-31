import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class FormValidationUtil {
  // Custom email validator
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null; // Don't validate empty values to allow optional fields
      }

      const emailRegex =
        /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
      const valid = emailRegex.test(control.value);

      return valid ? null : { invalidEmail: { value: control.value } };
    };
  }

  // Custom username validator
  static usernameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      const valid = usernameRegex.test(control.value);

      return valid ? null : { invalidUsername: { value: control.value } };
    };
  }

  // Password strength validator
  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: any = {};

      if (password.length < 6) {
        errors.minLength = true;
      }

      if (password.length > 100) {
        errors.maxLength = true;
      }

      // Check for at least one letter and one number for stronger passwords
      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        errors.weakPassword = true;
      }

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  // Confirm password validator
  static confirmPasswordValidator(passwordControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get(passwordControlName);
      const confirmPassword = control;

      if (!password || !confirmPassword) {
        return null;
      }

      if (password.value !== confirmPassword.value) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }

  // Rating validator (1-5)
  static ratingValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const rating = Number(control.value);
      if (rating < 1 || rating > 5) {
        return { invalidRating: { value: control.value } };
      }

      return null;
    };
  }

  // ISBN validator
  static isbnValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isbn = control.value.replace(/[-\s]/g, ""); // Remove hyphens and spaces

      // Check for ISBN-10 or ISBN-13 format
      if (!/^\d{10}$/.test(isbn) && !/^\d{13}$/.test(isbn)) {
        return { invalidIsbn: { value: control.value } };
      }

      return null;
    };
  }

  // Get error message for a form control
  static getErrorMessage(
    control: AbstractControl | null,
    fieldName: string
  ): string {
    if (!control || !control.errors) {
      return "";
    }

    const errors = control.errors;

    if (errors["required"]) {
      return `${fieldName} is required`;
    }

    if (errors["minlength"]) {
      return `${fieldName} must be at least ${errors["minlength"].requiredLength} characters long`;
    }

    if (errors["maxlength"]) {
      return `${fieldName} must not exceed ${errors["maxlength"].requiredLength} characters`;
    }

    if (errors["invalidEmail"]) {
      return "Please enter a valid email address";
    }

    if (errors["invalidUsername"]) {
      return "Username can only contain letters, numbers, and underscores (3-20 characters)";
    }

    if (errors["minLength"]) {
      return `${fieldName} must be at least 6 characters long`;
    }

    if (errors["maxLength"]) {
      return `${fieldName} must not exceed 100 characters`;
    }

    if (errors["weakPassword"]) {
      return "Password must contain at least one letter and one number";
    }

    if (errors["passwordMismatch"]) {
      return "Passwords do not match";
    }

    if (errors["invalidRating"]) {
      return "Rating must be between 1 and 5";
    }

    if (errors["invalidIsbn"]) {
      return "Please enter a valid ISBN (10 or 13 digits)";
    }

    return `${fieldName} is invalid`;
  }

  // Check if a field is invalid and should show error
  static isFieldInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Mark all fields as touched to show validation errors
  static markFormGroupTouched(formGroup: any): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control && typeof control === "object" && control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
