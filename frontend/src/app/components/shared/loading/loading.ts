import { Component, Input } from "@angular/core";


export type LoadingSize = "sm" | "md" | "lg";
export type LoadingVariant = "spinner" | "dots" | "pulse";

@Component({
  selector: "app-loading",
  standalone: true,
  imports: [],
  template: `
    <div class="loading-container" [class]="containerClass">
      <!-- Spinner variant -->
      @if (variant === 'spinner') {
        <div
          class="spinner-border"
          [class]="spinnerClass"
          role="status"
          >
          <span class="visually-hidden">{{ message }}</span>
        </div>
      }
    
      <!-- Dots variant -->
      @if (variant === 'dots') {
        <div class="loading-dots" [class]="dotsClass">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      }
    
      <!-- Pulse variant -->
      @if (variant === 'pulse') {
        <div
          class="loading-pulse"
          [class]="pulseClass"
          >
          <div class="pulse-circle"></div>
        </div>
      }
    
      <!-- Loading message -->
      @if (showMessage) {
        <p class="loading-message" [class]="messageClass">
          {{ message }}
        </p>
      }
    </div>
    `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }

      .loading-container.center {
        min-height: 200px;
      }

      .loading-container.inline {
        flex-direction: row;
        gap: 0.5rem;
        padding: 0.5rem;
        min-height: auto;
      }

      .loading-message {
        margin-top: 0.5rem;
        margin-bottom: 0;
        color: #6c757d;
        font-size: 0.9rem;
      }

      .loading-message.sm {
        font-size: 0.8rem;
      }

      .loading-message.lg {
        font-size: 1rem;
      }

      /* Spinner sizes */
      .spinner-border.sm {
        width: 1rem;
        height: 1rem;
      }

      .spinner-border.lg {
        width: 3rem;
        height: 3rem;
      }

      /* Dots animation */
      .loading-dots {
        display: flex;
        gap: 0.25rem;
      }

      .loading-dots .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #007bff;
        animation: dot-pulse 1.4s infinite ease-in-out both;
      }

      .loading-dots.sm .dot {
        width: 6px;
        height: 6px;
      }

      .loading-dots.lg .dot {
        width: 12px;
        height: 12px;
      }

      .loading-dots .dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      .loading-dots .dot:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes dot-pulse {
        0%,
        80%,
        100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      /* Pulse animation */
      .loading-pulse .pulse-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #007bff;
        animation: pulse-scale 1s infinite ease-in-out;
      }

      .loading-pulse.sm .pulse-circle {
        width: 24px;
        height: 24px;
      }

      .loading-pulse.lg .pulse-circle {
        width: 60px;
        height: 60px;
      }

      @keyframes pulse-scale {
        0% {
          transform: scale(0);
          opacity: 1;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
    `,
  ],
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
