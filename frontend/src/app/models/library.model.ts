import { Book } from './book.model';

export interface UserBook {
  id: number;
  userId: number;
  bookId: number;
  book: Book;
  status: 'read' | 'to_read';
  rating?: number;
  review?: string;
  readDate?: Date;
  isFavourite: boolean;
}

export interface LibraryStats {
  totalBooks: number;
  booksRead: number;
  booksToRead: number;
  averageRating: number;
  favoriteBooks: number;
}

export interface AddBookToLibraryRequest {
  bookId: number;
  status: 'read' | 'to_read';
  rating?: number;
  review?: string;
  isFavourite?: boolean;
}

export interface UpdateBookStatusRequest {
  status: 'read' | 'to_read';
  rating?: number;
  review?: string;
  isFavourite?: boolean;
}