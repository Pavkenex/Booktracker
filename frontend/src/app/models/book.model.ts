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
}

export interface BookSearchParams {
  page?: number;
  size?: number;
  title?: string;
  author?: string;
  genreId?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}