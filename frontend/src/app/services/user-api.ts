import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { UpdateProfilePayload, UserProfileResponse } from "../models/user.model";
import { APP_CONSTANTS } from "../constants/app.constants";

@Injectable({
  providedIn: "root",
})
export class UserApi {
  private readonly API_URL = `${environment.apiUrl}/users`;
  private readonly assetsUrl = environment.assetsUrl;
  readonly defaultAvatar = APP_CONSTANTS.DEFAULT_AVATAR_PLACEHOLDER;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.API_URL}/profile`);
  }

  updateProfile(payload: UpdateProfilePayload): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.API_URL}/profile`, payload);
  }

  uploadAvatar(file: File): Observable<UserProfileResponse> {
    const formData = new FormData();
    formData.append("avatar", file);
    return this.http.post<UserProfileResponse>(`${this.API_URL}/profile/avatar`, formData);
  }

  resolveAvatarUrl(avatarUrl?: string | null): string {
    if (!avatarUrl) {
      return this.defaultAvatar;
    }

    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }

    const prefix = avatarUrl.startsWith('/') ? '' : '/';
    return `${this.assetsUrl}${prefix}${avatarUrl}`;
  }
}
