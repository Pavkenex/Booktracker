import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from "@angular/core";
import { Subject } from "rxjs";

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  buffer: number; // Number of items to render outside visible area
}

@Directive({
  selector: "[appVirtualScroll]",
})
export class VirtualScrollDirective<T> implements OnInit, OnDestroy {
  @Input() appVirtualScrollItems: T[] = [];
  @Input() appVirtualScrollConfig: VirtualScrollConfig = {
    itemHeight: 100,
    containerHeight: 400,
    buffer: 3,
  };

  private destroy$ = new Subject<void>();
  private scrollTop = 0;

  constructor(
    private templateRef: TemplateRef<{ $implicit: T; index: number }>,
    private viewContainer: ViewContainerRef,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateVisibleItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.scrollTop = target.scrollTop;
    this.updateVisibleItems();
  }

  private updateVisibleItems(): void {
    const { itemHeight, containerHeight, buffer } = this.appVirtualScrollConfig;
    const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / itemHeight) - buffer
    );
    const endIndex = Math.min(
      this.appVirtualScrollItems.length,
      startIndex + visibleItemsCount + buffer * 2
    );

    this.viewContainer.clear();

    for (let i = startIndex; i < endIndex; i++) {
      const context = {
        $implicit: this.appVirtualScrollItems[i],
        index: i,
      };
      this.viewContainer.createEmbeddedView(this.templateRef, context);
    }

    this.cdr.detectChanges();
  }
}
