import { Book } from "./book.model";

/**
 * State interface for popular books component
 */
export interface PopularBooksState {
  books: Book[];
  loading: boolean;
  error: boolean;
  slider: SliderState;
}

/**
 * State interface for slider functionality
 */
export interface SliderState {
  currentSlide: number;
  booksPerSlide: number;
  totalSlides: number;
  maxSlide: number;
}

/**
 * Initial state factory
 */
export class PopularBooksStateFactory {
  static createInitialState(): PopularBooksState {
    return {
      books: [],
      loading: false,
      error: false,
      slider: {
        currentSlide: 0,
        booksPerSlide: 4,
        totalSlides: 0,
        maxSlide: 0,
      },
    };
  }

  static updateSliderState(
    state: PopularBooksState,
    books: Book[],
    booksPerSlide: number
  ): PopularBooksState {
    const totalSlides = Math.ceil(books.length / booksPerSlide);
    const maxSlide = Math.max(0, totalSlides - 1);
    const currentSlide = Math.min(state.slider.currentSlide, maxSlide);

    return {
      ...state,
      slider: {
        currentSlide,
        booksPerSlide,
        totalSlides,
        maxSlide,
      },
    };
  }
}
