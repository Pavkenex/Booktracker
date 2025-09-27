/**
 * Configuration for slider breakpoints
 */
export interface SliderBreakpoints {
  MOBILE: number;
  TABLET: number;
  DESKTOP: number;
}

/**
 * Configuration for items per slide at different breakpoints
 */
export interface SliderItemsConfig {
  MOBILE: number;
  TABLET: number;
  DESKTOP: number;
  LARGE: number;
}

/**
 * Result type for operations that can fail
 */
type SliderResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Utility class for managing slider functionality
 */
export class SliderUtil {
  /**
   * Calculates the number of items per slide based on screen width
   * @param screenWidth - Current screen width in pixels
   * @param breakpoints - Breakpoint configuration object
   * @param itemsConfig - Items per slide configuration object
   * @returns Number of items to display per slide
   * @throws Error if screenWidth is negative or breakpoints/itemsConfig are invalid
   */
  static calculateItemsPerSlide(
    screenWidth: number,
    breakpoints: SliderBreakpoints,
    itemsConfig: SliderItemsConfig
  ): number {
    if (screenWidth < 0) {
      throw new Error("Screen width cannot be negative");
    }

    if (!this.isValidBreakpoints(breakpoints)) {
      throw new Error("Invalid breakpoints configuration");
    }

    if (!this.isValidItemsConfig(itemsConfig)) {
      throw new Error("Invalid items configuration");
    }

    const { MOBILE, TABLET, DESKTOP } = breakpoints;
    const {
      MOBILE: MOBILE_ITEMS,
      TABLET: TABLET_ITEMS,
      DESKTOP: DESKTOP_ITEMS,
      LARGE,
    } = itemsConfig;

    if (screenWidth < MOBILE) {
      return MOBILE_ITEMS;
    } else if (screenWidth < TABLET) {
      return TABLET_ITEMS;
    } else if (screenWidth < DESKTOP) {
      return DESKTOP_ITEMS;
    } else {
      return LARGE;
    }
  }

  /**
   * Safe version of calculateItemsPerSlide that returns a Result type
   * @param screenWidth - Current screen width in pixels
   * @param breakpoints - Breakpoint configuration object
   * @param itemsConfig - Items per slide configuration object
   * @returns SliderResult with either success data or error message
   */
  static safeCalculateItemsPerSlide(
    screenWidth: number,
    breakpoints: SliderBreakpoints,
    itemsConfig: SliderItemsConfig
  ): SliderResult<number> {
    try {
      const result = this.calculateItemsPerSlide(
        screenWidth,
        breakpoints,
        itemsConfig
      );
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Validates breakpoints configuration
   */
  private static isValidBreakpoints(breakpoints: SliderBreakpoints): boolean {
    return (
      typeof breakpoints.MOBILE === "number" &&
      typeof breakpoints.TABLET === "number" &&
      typeof breakpoints.DESKTOP === "number" &&
      breakpoints.MOBILE > 0 &&
      breakpoints.TABLET > breakpoints.MOBILE &&
      breakpoints.DESKTOP > breakpoints.TABLET
    );
  }

  /**
   * Validates items configuration
   */
  private static isValidItemsConfig(itemsConfig: SliderItemsConfig): boolean {
    return (
      typeof itemsConfig.MOBILE === "number" &&
      typeof itemsConfig.TABLET === "number" &&
      typeof itemsConfig.DESKTOP === "number" &&
      typeof itemsConfig.LARGE === "number" &&
      itemsConfig.MOBILE > 0 &&
      itemsConfig.TABLET > 0 &&
      itemsConfig.DESKTOP > 0 &&
      itemsConfig.LARGE > 0
    );
  }

  /**
   * Calculates total number of slides needed
   */
  static calculateTotalSlides(
    totalItems: number,
    itemsPerSlide: number
  ): number {
    return Math.ceil(totalItems / itemsPerSlide);
  }

  /**
   * Calculates the maximum slide index
   */
  static calculateMaxSlide(totalSlides: number): number {
    return Math.max(0, totalSlides - 1);
  }

  /**
   * Gets items for a specific slide
   */
  static getSlideItems<T>(
    items: T[],
    slideIndex: number,
    itemsPerSlide: number
  ): T[] {
    if (!items || items.length === 0) return [];
    if (slideIndex < 0 || itemsPerSlide <= 0) return [];

    const startIndex = slideIndex * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    return items.slice(startIndex, endIndex);
  }

  /**
   * Validates and adjusts slide index to prevent showing empty space
   */
  static adjustSlideIndex(
    currentSlide: number,
    totalItems: number,
    itemsPerSlide: number
  ): number {
    const maxSlide = this.calculateMaxSlide(
      this.calculateTotalSlides(totalItems, itemsPerSlide)
    );
    return Math.min(currentSlide, maxSlide);
  }

  /**
   * Creates an array of slide indices for indicators
   */
  static createSlideIndicators(totalSlides: number): number[] {
    return Array.from({ length: totalSlides }, (_, i) => i);
  }
}
