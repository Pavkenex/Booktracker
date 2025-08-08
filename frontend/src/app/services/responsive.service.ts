import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";

export interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLarge: boolean;
}

export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

@Injectable({
  providedIn: "root",
})
export class ResponsiveService {
  private readonly defaultBreakpoints: Breakpoints = {
    mobile: 576,
    tablet: 768,
    desktop: 992,
  };

  private screenSize$ = new BehaviorSubject<ScreenSize>(
    this.getCurrentScreenSize()
  );

  constructor() {
    // Listen to window resize events
    fromEvent(window, "resize")
      .pipe(
        debounceTime(100),
        map(() => this.getCurrentScreenSize()),
        distinctUntilChanged(
          (prev, curr) =>
            prev.width === curr.width &&
            prev.isMobile === curr.isMobile &&
            prev.isTablet === curr.isTablet &&
            prev.isDesktop === curr.isDesktop
        )
      )
      .subscribe((screenSize) => this.screenSize$.next(screenSize));
  }

  /**
   * Get current screen size as observable
   */
  getScreenSize(): Observable<ScreenSize> {
    return this.screenSize$.asObservable();
  }

  /**
   * Get current screen width as observable
   */
  getScreenWidth(): Observable<number> {
    return this.screenSize$.pipe(map((size) => size.width));
  }

  /**
   * Check if screen matches specific breakpoint
   */
  isBreakpoint(breakpoint: keyof Breakpoints): Observable<boolean> {
    return this.screenSize$.pipe(
      map((size) => {
        switch (breakpoint) {
          case "mobile":
            return size.isMobile;
          case "tablet":
            return size.isTablet;
          case "desktop":
            return size.isDesktop;
          default:
            return false;
        }
      })
    );
  }

  private getCurrentScreenSize(
    breakpoints: Breakpoints = this.defaultBreakpoints
  ): ScreenSize {
    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      width,
      height,
      isMobile: width < breakpoints.mobile,
      isTablet: width >= breakpoints.mobile && width < breakpoints.tablet,
      isDesktop: width >= breakpoints.tablet && width < breakpoints.desktop,
      isLarge: width >= breakpoints.desktop,
    };
  }
}
