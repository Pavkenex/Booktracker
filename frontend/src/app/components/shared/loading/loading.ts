import { Component, Input } from "@angular/core";


export type LoadingSize = "sm" | "md" | "lg";
export type LoadingVariant = "spinner" | "dots" | "pulse";

@Component({
  selector: "app-loading",
  standalone: true,
  imports: [],
  templateUrl: './loading.html',
  styleUrls: ['./loading.css'],
})
export class LoadingComponent {
  @Input() message = "Loading...";
  @Input() size: LoadingSize = "md";
  @Input() variant: LoadingVariant = "spinner";
  @Input() showMessage = true;
  @Input() center = true;

  get containerClass(): string {
    return this.center ? "center" : "inline";
  }

  get spinnerClass(): string {
    const baseClass = "text-primary";
    return this.size === "md" ? baseClass : `${baseClass} ${this.size}`;
  }

  get dotsClass(): string {
    return this.size === "md" ? "" : this.size;
  }

  get pulseClass(): string {
    return this.size === "md" ? "" : this.size;
  }

  get messageClass(): string {
    return this.size === "md" ? "" : this.size;
  }
}
