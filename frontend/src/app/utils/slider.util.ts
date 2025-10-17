export interface SliderBreakpoints {
  MOBILE: number;
  TABLET: number;
  DESKTOP: number;
}

export interface SliderItemsConfig {
  MOBILE: number;
  TABLET: number;
  DESKTOP: number;
  LARGE: number;
}

type SliderResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export class SliderUtil {
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

  static calculateTotalSlides(
    totalItems: number,
    itemsPerSlide: number
  ): number {
    return Math.ceil(totalItems / itemsPerSlide);
  }

  static calculateMaxSlide(totalSlides: number): number {
    return Math.max(0, totalSlides - 1);
  }

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

  static createSlideIndicators(totalSlides: number): number[] {
    return Array.from({ length: totalSlides }, (_, i) => i);
  }
}
