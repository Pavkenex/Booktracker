export interface UserProfile {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isAdmin: boolean;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
}

export interface UpdateProfilePayload {
  username: string;
  email: string;
}
