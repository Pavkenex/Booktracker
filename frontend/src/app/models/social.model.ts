import { Book } from './book.model';

export interface User {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'rejected';
  friend?: User;
  user?: User;
}

export interface FriendRequest {
  id: number;
  userId: number;
  friendId: number;
  status: 'pending' | 'accepted' | 'rejected';
  sender: User;
  receiver: User;
  createdAt: string;
}

export interface Recommendation {
  id: number;
  senderId: number;
  receiverId: number;
  bookId: number;
  message?: string;
  createdAt: string;
  sender: User;
  receiver: User;
  book: Book;
  isRead?: boolean;
}

export interface SendFriendRequestRequest {
  friendId: number;
}

export interface RespondToFriendRequestRequest {
  requestId: number;
  accept: boolean;
}

export interface SendRecommendationRequest {
  receiverId: number;
  bookId: number;
  message?: string;
}

export interface FriendSearchResult {
  id: number;
  username: string;
  email: string;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

export interface NotificationCount {
  friendRequests: number;
  recommendations: number;
  total: number;
}
