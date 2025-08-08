import { Book } from "../../../models/book.model";

export interface PopularBooksSectionState {
  // Data state
  books: Book[];

  // Loading states
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;

  // Slider state
  currentSlide: number;
  itemsPerSlide: number;
  totalSlides: number;
  maxSlide: number;

  // UI state
  isTransitioning: boolean;
}

export const initialPopularBooksSectionState: PopularBooksSectionState = {
  books: [],
  isLoading: false,
  hasError: false,
  currentSlide: 0,
  itemsPerSlide: 4,
  totalSlides: 0,
  maxSlide: 0,
  isTransitioning: false,
};

export type PopularBooksSectionAction =
  | { type: "LOAD_BOOKS_START" }
  | { type: "LOAD_BOOKS_SUCCESS"; payload: Book[] }
  | { type: "LOAD_BOOKS_ERROR"; payload: string }
  | { type: "UPDATE_SLIDER_CONFIG"; payload: { itemsPerSlide: number } }
  | { type: "NAVIGATE_SLIDE"; payload: number }
  | { type: "SET_TRANSITIONING"; payload: boolean };

export function popularBooksSectionReducer(
  state: PopularBooksSectionState,
  action: PopularBooksSectionAction
): PopularBooksSectionState {
  switch (action.type) {
    case "LOAD_BOOKS_START":
      return {
        ...state,
        isLoading: true,
        hasError: false,
        errorMessage: undefined,
      };

    case "LOAD_BOOKS_SUCCESS": {
      const books = action.payload;
      const totalSlides = Math.ceil(books.length / state.itemsPerSlide);
      const maxSlide = Math.max(0, totalSlides - 1);

      return {
        ...state,
        books,
        isLoading: false,
        hasError: false,
        totalSlides,
        maxSlide,
        currentSlide: Math.min(state.currentSlide, maxSlide),
      };
    }

    case "LOAD_BOOKS_ERROR":
      return {
        ...state,
        isLoading: false,
        hasError: true,
        errorMessage: action.payload,
      };

    case "UPDATE_SLIDER_CONFIG": {
      const { itemsPerSlide } = action.payload;
      const newTotalSlides = Math.ceil(state.books.length / itemsPerSlide);
      const newMaxSlide = Math.max(0, newTotalSlides - 1);

      return {
        ...state,
        itemsPerSlide,
        totalSlides: newTotalSlides,
        maxSlide: newMaxSlide,
        currentSlide: Math.min(state.currentSlide, newMaxSlide),
      };
    }

    case "NAVIGATE_SLIDE":
      return {
        ...state,
        currentSlide: Math.max(0, Math.min(action.payload, state.maxSlide)),
      };

    case "SET_TRANSITIONING":
      return {
        ...state,
        isTransitioning: action.payload,
      };

    default:
      return state;
  }
}
