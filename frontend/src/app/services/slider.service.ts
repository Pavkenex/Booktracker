import { Injectable } from "@angular/core";
import {
  SliderUtil,
  SliderBreakpoints,
  SliderItemsConfig,
} from "../utils/slider.util";

export interface SliderConfig {
  breakpoints: SliderBreakpoints;
  itemsPerSlide: SliderItemsConfig;
}

export interface SliderState<T> {
  items: T[];
  currentSlide: number;
  itemsPerSlide: number;
  totalSlides: number;
  maxSlide: number;
  currentSlideItems: T[];
  slideIndicators: number[];
}

@Injectable({
  providedIn: "root",
})
export class SliderService {
  /**
   * Creates a slider state object with all computed properties
   */
  createSliderState<T>(
    items: T[],
    currentSlide: number,
    screenWidth: number,
    config: SliderConfig
  ): SliderState<T> {
    const itemsPerSlide = SliderUtil.calculateItemsPerSlide(
      screenWidth,
      config.breakpoints,
      config.itemsPerSlide
    );

    const totalSlides = SliderUtil.calculateTotalSlides(
      items.length,
      itemsPerSlide
    );
    const maxSlide = SliderUtil.calculateMaxSlide(totalSlides);
    const adjustedCurrentSlide = SliderUtil.adjustSlideIndex(
      currentSlide,
      items.length,
      itemsPerSlide
    );
    const currentSlideItems = SliderUtil.getSlideItems(
      items,
      adjustedCurrentSlide,
      itemsPerSlide
    );
    const slideIndicators = SliderUtil.createSlideIndicators(totalSlides);

    return {
      items,
      currentSlide: adjustedCurrentSlide,
      itemsPerSlide,
      totalSlides,
      maxSlide,
      currentSlideItems,
      slideIndicators,
    };
  }

  /**
   * Validates and adjusts slide navigation
   */
  navigateSlide(
    currentSlide: number,
    direction: "prev" | "next" | number,
    maxSlide: number
  ): number {
    if (typeof direction === "number") {
      return Math.max(0, Math.min(direction, maxSlide));
    }

    if (direction === "prev") {
      return Math.max(0, currentSlide - 1);
    }

    if (direction === "next") {
      return Math.min(currentSlide + 1, maxSlide);
    }

    return currentSlide;
  }
}
