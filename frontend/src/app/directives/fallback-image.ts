import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { APP_CONSTANTS } from "../constants/app.constants";

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
