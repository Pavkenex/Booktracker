import { Directive, TemplateRef } from "@angular/core";

export interface SliderItemContext<T> {
  $implicit: T;
  index: number;
  slideIndex: number;
  globalIndex: number;
}

@Directive({
  selector: "[appSliderItem]",
  standalone: true,
})
export class SliderItemDirective<T> {
  constructor(public readonly template: TemplateRef<SliderItemContext<T>>) {}
}
