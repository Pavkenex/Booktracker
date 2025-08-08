export const POPULAR_BOOKS_CONSTANTS = {
  LOADING_STATES: {
    LOADING_MESSAGE: "Loading popular books...",
    ERROR_TITLE: "Unable to load popular books",
    ERROR_MESSAGE:
      "There was an issue loading the popular books. Please try again later.",
    EMPTY_TITLE: "No popular books yet",
    EMPTY_MESSAGE:
      "Popular books will appear here as users discover and view them.",
    RETRY_BUTTON_TEXT: "Retry",
  },

  SLIDER: {
    TRANSITION_DURATION: 300, // ms
    SLIDE_CHANGE_DEBOUNCE: 100, // ms
    MAX_GENRES_DISPLAY: 2,
    RANK_CALCULATION_OFFSET: 1,
  },

  ACCESSIBILITY: {
    PREVIOUS_ARIA_LABEL: "Previous books",
    NEXT_ARIA_LABEL: "Next books",
    SLIDE_ARIA_LABEL_PREFIX: "Go to slide ",
    LOADING_ARIA_LABEL: "Loading popular books",
  },

  CSS_CLASSES: {
    SLIDER_TRACK_CHANGING: "changing",
    INDICATOR_ACTIVE: "active",
    BUTTON_DISABLED: "disabled",
  },
} as const;
