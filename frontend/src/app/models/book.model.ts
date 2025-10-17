export interface Genre {
  id: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  publishedYear?: number;
  thumbnail?: string;
  description?: string;
  genres?: Genre[];
  viewCount?: number;
  rating?: number;
}

export interface BookSearchParams {
  page?: number;
  size?: number;
  title?: string;
  author?: string;
  genreId?: number | string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  page: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface ApiResponse<T> {
  success: boolean;
  message?: string; 
  data: T;
}
