import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TrackByFunction,
} from "@angular/core";
import { CommonModule, NgTemplateOutlet } from "@angular/common";

import { SliderItemDirective, SliderItemContext } from "./slider-item.directive";
import {
  SliderBreakpoints,
  SliderItemsConfig,
  SliderUtil,
} from "../../../utils/slider.util";
import { APP_CONSTANTS } from "../../../constants/app.constants";

@Component({
  selector: "app-slider",
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet],
  templateUrl: "./slider.component.html",
  styleUrls: ["./slider.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: "appSlider",
})
export class SliderComponent<T> implements OnInit, OnChanges {
  @Input() items: ReadonlyArray<T> = [];
  @Input() breakpoints: SliderBreakpoints =
    APP_CONSTANTS.POPULAR_BOOKS.BREAKPOINTS;
  @Input() itemsPerSlideConfig: SliderItemsConfig =
    APP_CONSTANTS.POPULAR_BOOKS.BOOKS_PER_SLIDE;
  @Input() trackBy?: TrackByFunction<T>;
  @Input() showControls = true;
  @Input() showIndicators = true;
  @Input() trackMinHeight?: number;
  @Input() slideGap = "1.5rem";
  @Input() justifyContent: "flex-start" | "center" | "space-between" =
    "flex-start";
  @Input() alignItems: "stretch" | "center" = "stretch";
  @Input() prevIcon = "fas fa-chevron-left";
  @Input() nextIcon = "fas fa-chevron-right";

  @ContentChild(SliderItemDirective) itemTemplate?: SliderItemDirective<T>;

  private currentSlide = 0;
  protected itemsPerSlide = 1;
  private slideGroups: T[][] = [];

  private touchStartX = 0;
  private touchEndX = 0;
  private readonly minSwipeDistance = 50;

  readonly trackByItem = (index: number, item: T) =>
    this.trackSlideItem(index, item);

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.rebuildSliderState(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["items"] ||
      changes["breakpoints"] ||
      changes["itemsPerSlideConfig"]
    ) {
      const shouldReset = changes["items"]?.firstChange ?? false;
      this.rebuildSliderState(shouldReset);
    }

    if (changes["trackBy"] && !changes["trackBy"].firstChange) {
      this.cdr.markForCheck();
    }
  }

  @HostListener("window:resize")
  onWindowResize(): void {
    this.rebuildSliderState(false);
  }

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  get totalSlides(): number {
    return SliderUtil.calculateTotalSlides(this.items.length, this.itemsPerSlide);
  }

  get maxSlide(): number {
    return SliderUtil.calculateMaxSlide(this.totalSlides);
  }

  get slidesArray(): number[] {
    return SliderUtil.createSlideIndicators(this.totalSlides);
  }

  get slides(): ReadonlyArray<ReadonlyArray<T>> {
    return this.slideGroups;
  }

  get currentIndex(): number {
    return this.currentSlide;
  }

  get trackTransform(): string {
    if (this.slideGroups.length <= 1) {
      return "translateX(0)";
    }

    const step = 100 / this.slideGroups.length;
    const offset = this.currentSlide * step;
    return `translateX(-${offset}%)`;
  }

  get trackWidthPercent(): number {
    return Math.max(this.slideGroups.length, 1) * 100;
  }

  get slideWidthPercent(): number {
    return this.slideGroups.length > 0 ? 100 / this.slideGroups.length : 100;
  }

  get canGoPrevious(): boolean {
    return this.hasItems && this.currentSlide > 0;
  }

  get canGoNext(): boolean {
    return this.hasItems && this.currentSlide < this.maxSlide;
  }

  getGridTemplate(itemsInSlide: number): string {
    const columns = Math.max(1, Math.min(itemsInSlide, this.itemsPerSlide));
    return `repeat(${columns}, minmax(0, 1fr))`;
  }

  previousSlide(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.currentSlide = Math.max(0, this.currentSlide - 1);
    this.cdr.markForCheck();
  }

  nextSlide(): void {
    if (!this.canGoNext) {
      return;
    }

    this.currentSlide = Math.min(this.currentSlide + 1, this.maxSlide);
    this.cdr.markForCheck();
  }

  goToSlide(slideIndex: number): void {
    if (slideIndex < 0 || slideIndex > this.maxSlide) {
      return;
    }

    this.currentSlide = slideIndex;
    this.cdr.markForCheck();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (swipeDistance > this.minSwipeDistance) {
      this.nextSlide();
    }
    else if (swipeDistance < -this.minSwipeDistance) {
      this.previousSlide();
    }
  }

  createContext(
    item: T,
    slideIndex: number,
    indexWithinSlide: number
  ): SliderItemContext<T> {
    return {
      $implicit: item,
      index: indexWithinSlide,
      slideIndex,
      globalIndex: slideIndex * this.itemsPerSlide + indexWithinSlide,
    };
  }

  private rebuildSliderState(resetSlide: boolean): void {
    this.itemsPerSlide = this.calculateItemsPerSlide();

    if (!this.hasItems) {
      this.slideGroups = [];
      this.currentSlide = 0;
      this.cdr.markForCheck();
      return;
    }

    this.slideGroups = this.buildSlideGroups();

    const shouldReset = resetSlide || this.currentSlide > this.maxSlide;
    this.currentSlide = shouldReset
      ? 0
      : SliderUtil.adjustSlideIndex(
          this.currentSlide,
          this.items.length,
          this.itemsPerSlide
        );

    this.cdr.markForCheck();
  }

  private calculateItemsPerSlide(): number {
    const width = this.getViewportWidth();
    try {
      const result = SliderUtil.calculateItemsPerSlide(
        width,
        this.breakpoints,
        this.itemsPerSlideConfig
      );
      return Math.max(result, 1);
    } catch (error) {
      console.error("Failed to calculate items per slide", error);
      return 1;
    }
  }

  private buildSlideGroups(): T[][] {
    if (!this.itemsPerSlide || this.itemsPerSlide <= 0) {
      return [];
    }

    const groups: T[][] = [];
    const totalSlides = this.totalSlides;

    for (let i = 0; i < totalSlides; i++) {
      groups.push(
        SliderUtil.getSlideItems(this.items as T[], i, this.itemsPerSlide)
      );
    }

    return groups;
  }

  private getViewportWidth(): number {
    if (typeof window === "undefined") {
      return this.breakpoints.DESKTOP;
    }

    return window.innerWidth;
  }

  private trackSlideItem(index: number, item: T): unknown {
    if (this.trackBy) {
      return this.trackBy(index, item);
    }

    return index;
  }
}
