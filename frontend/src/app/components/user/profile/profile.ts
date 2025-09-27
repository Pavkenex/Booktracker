import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { AuthStore } from "../../../services/auth-store";
import { ErrorHandler } from "../../../services/error-handler";
import { UserApi } from "../../../services/user-api";
import {
  UpdateProfilePayload,
  UserProfile,
  UserProfileResponse,
} from "../../../models/user.model";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-profile",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: "./profile.html",
  styleUrls: ["./profile.css"],
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  profile?: UserProfile;

  isLoading = true;
  isSaving = false;
  avatarUploading = false;
  resettingPassword = false;

  avatarPreviewUrl: string | null = null;
  private avatarObjectUrl?: string;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly userApi: UserApi,
    private readonly authStore: AuthStore,
    private readonly errorHandler: ErrorHandler
  ) {
    this.profileForm = this.fb.group({
      username: [
        "",
        [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
      ],
      email: [
        "",
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.avatarObjectUrl) {
      URL.revokeObjectURL(this.avatarObjectUrl);
    }
  }

  get usernameControl() {
    return this.profileForm.get("username");
  }

  get emailControl() {
    return this.profileForm.get("email");
  }

  get profileInitial(): string {
    const name = this.usernameControl?.value || this.profile?.username || "";
    return name ? name.charAt(0).toUpperCase() : "U";
  }

  onSaveProfile(): void {
    if (this.profileForm.invalid || !this.profile) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const payload: UpdateProfilePayload = {
      username: this.usernameControl?.value,
      email: this.emailControl?.value,
    };

    this.isSaving = true;
    this.userApi
      .updateProfile(payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSaving = false))
      )
      .subscribe({
        next: (response) =>
          this.handleProfileResponse(response, "Profile updated successfully"),
        error: (error) =>
          this.errorHandler.showError(
            this.errorHandler.handleHttpError(error)
          ),
      });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const previousAvatarUrl = this.profile?.avatarUrl;

    this.setTemporaryPreview(file);

    this.avatarUploading = true;
    this.userApi
      .uploadAvatar(file)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.avatarUploading = false;
          if (input) {
            input.value = "";
          }
        })
      )
      .subscribe({
        next: (response) =>
          this.handleProfileResponse(response, "Avatar updated successfully"),
        error: (error) => {
          this.updatePreviewFromServer(previousAvatarUrl);
          this.errorHandler.showError(
            this.errorHandler.handleHttpError(error)
          );
        },
      });
  }

  onResetPassword(): void {
    if (!this.emailControl?.value) {
      this.errorHandler.showWarning("Please provide a valid email first.");
      return;
    }

    this.resettingPassword = true;
    this.authStore
      .requestPasswordReset({ email: this.emailControl.value })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.resettingPassword = false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.errorHandler.showSuccess(
              "If the email exists, a reset link has been sent."
            );
          } else {
            this.errorHandler.showWarning(response.message || "Password reset could not be initiated.");
          }
        },
        error: (error) =>
          this.errorHandler.showError(
            this.errorHandler.handleHttpError(error)
          ),
      });
  }

  get isFormDirty(): boolean {
    if (!this.profile) {
      return false;
    }
    return (
      this.usernameControl?.value !== this.profile.username ||
      this.emailControl?.value !== this.profile.email
    );
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.userApi
      .getProfile()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (response) => this.handleProfileResponse(response),
        error: (error) =>
          this.errorHandler.showError(
            this.errorHandler.handleHttpError(error)
          ),
      });
  }

  private handleProfileResponse(
    response: UserProfileResponse,
    successMessage?: string
  ): void {
    if (response.success && response.user) {
      this.applyProfile(response.user);
      if (successMessage) {
        this.errorHandler.showSuccess(successMessage);
      }
    } else if (response.message) {
      this.errorHandler.showError(response.message);
    } else {
      this.errorHandler.showError("An unexpected error occurred.");
    }
  }

  private applyProfile(user: UserProfile, patchForm: boolean = true): void {
    this.profile = user;

    if (patchForm) {
      this.profileForm.patchValue(
        {
          username: user.username,
          email: user.email,
        },
        { emitEvent: false }
      );
    }

    this.updatePreviewFromServer(user.avatarUrl);

    const currentUser = this.authStore.getCurrentUser();
    if (currentUser) {
      this.authStore.updateStoredUser({
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
      });
    } else {
      this.authStore.setCurrentUser({
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        avatarUrl: user.avatarUrl,
      });
    }
  }

  private buildAvatarUrl(avatarUrl?: string | null): string | null {
    if (!avatarUrl) {
      return null;
    }

    if (avatarUrl.startsWith("http")) {
      return avatarUrl;
    }

    const prefix = avatarUrl.startsWith("/") ? "" : "/";
    return `${environment.assetsUrl}${prefix}${avatarUrl}`;
  }

  private updatePreviewFromServer(avatarUrl?: string | null): void {
    if (this.avatarObjectUrl) {
      URL.revokeObjectURL(this.avatarObjectUrl);
      this.avatarObjectUrl = undefined;
    }

    this.avatarPreviewUrl = this.buildAvatarUrl(avatarUrl);
  }

  private setTemporaryPreview(file: File): void {
    if (this.avatarObjectUrl) {
      URL.revokeObjectURL(this.avatarObjectUrl);
    }

    this.avatarObjectUrl = URL.createObjectURL(file);
    this.avatarPreviewUrl = this.avatarObjectUrl;
  }
}
