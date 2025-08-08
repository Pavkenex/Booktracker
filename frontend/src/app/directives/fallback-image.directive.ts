import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { APP_CONSTANTS } from "../constants/app.constants";

/**
 * Directive to handle image loading errors by setting a fallback image
 *
 * Usage: <img [src]="imageUrl" appFallbackImage [fallbackSrc]="customFallback" />
 */
@Directive({
  selector: "[appFallbackImage]",
  standalone: true,
})
export class FallbackImageDirective {
  @Input() fallbackSrc: string = APP_CONSTANTS.DEFAULT_BOOK_PLACEHOLDER;

  constructor(private elementRef: ElementRef<HTMLImageElement>) {}

  @HostListener("error", ["$event"])
  onImageError(event: Event): void {
    const imgElement = this.elementRef.nativeElement;
    if (imgElement && imgElement.src !== this.fallbackSrc) {
      imgElement.src = this.fallbackSrc;
    }
  }
}
