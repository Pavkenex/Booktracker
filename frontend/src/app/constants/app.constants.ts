/**
 * Application-wide constants
 */
export const APP_CONSTANTS = {
  /**
   * Default placeholder image for books without thumbnails
   */
  DEFAULT_BOOK_PLACEHOLDER: "/assets/images/book-placeholder.svg",

  /**
   * Default placeholder image for user avatars
   */
  DEFAULT_AVATAR_PLACEHOLDER: "/assets/images/avatar-placeholder.svg",

  /**
   * Popular books configuration
   */
  POPULAR_BOOKS: {
    DEFAULT_LIMIT: 20,
    BOOKS_PER_SLIDE: {
      MOBILE: 2,
      TABLET: 2,
      DESKTOP: 3,
      LARGE: 4,
    },
    BREAKPOINTS: {
      MOBILE: 576,
      TABLET: 768,
      DESKTOP: 992,
    },
  },

  /**
   * UI timeouts and delays
   */
  TIMEOUTS: {
    MESSAGE_DISPLAY: 5000,
    LOADING_DEBOUNCE: 300,
  },
} as const;
