import { Book } from './book.model';

export interface UserBook {
  id: number;
  book: Book;
  status: 'read' | 'currently_reading' | 'to_read';
  rating?: number;
  review?: string;
  readDate?: string;
  isFavourite: boolean;
  username?: string; // reviewer username
}

export interface LibraryStats {
  totalBooks: number;
  booksRead: number;
  booksCurrentlyReading: number;
  booksToRead: number;
  averageRating: number;
  favoriteBooks: number;
  ratingDistribution?: { [key: number]: number };
}

export interface AddBookToLibraryRequest {
  bookId: number;
  status: 'read' | 'currently_reading' | 'to_read';
  rating?: number;
  review?: string;
  isFavourite?: boolean;
}

export interface UpdateBookStatusRequest {
  status: 'read' | 'currently_reading' | 'to_read';
  rating?: number;
  review?: string;
  isFavourite?: boolean;
}