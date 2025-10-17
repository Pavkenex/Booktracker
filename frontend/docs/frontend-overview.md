# Booktracker Frontend Documentation

## 1. Project Overview

The Booktracker frontend is a standalone Angular 20 application that provides the user interface for managing books, personal libraries, social interactions, and administrative reporting. The app is bootstrapped with Angular's standalone component APIs, uses lazy-loaded routes for feature areas, and communicates with the Spring Boot backend over a JSON REST API.

Key goals:

- Deliver a responsive, mobile-friendly interface for tracking reading activity.
- Provide authenticated user experiences with role-based access (user vs. admin).
- Offer reusable UI building blocks (shared components, directives, utilities) to keep features consistent.
- Handle API errors gracefully with toast notifications and global interceptors.

## 2. Tech Stack

| Area            | Details                                                   |
| --------------- | --------------------------------------------------------- |
| Framework       | Angular ^20.1 with standalone components                  |
| Language        | TypeScript 5.8, HTML, SCSS                                |
| UI Toolkit      | Bootstrap 5.3 utility classes + component-level styles    |
| State & Rx      | RxJS 7.8 (BehaviorSubjects, Subjects, Observables)        |
| HTTP            | Angular HttpClient with Auth & Error interceptors         |
| Build Tooling   | Angular CLI 20, Karma/Jasmine for unit tests              |
| Environment cfg | `src/environments/environment.ts` controls REST endpoints |

## 3. Quick Start

1. **Install dependencies** (from `frontend/`):
   ```
   npm install
   ```
2. **Run the development server** (defaults to `http://localhost:4200`):
   ```
   npm start
   ```
   The server proxies API calls directly to the backend URL configured in `environment.ts`.
3. **Execute a production build**:
   ```
   npm run build
   ```
4. **Run unit tests** (Karma + Jasmine):
   ```
   npm test
   ```

> **Prerequisites:** Node.js 18+, npm 9+, Angular CLI globally (`npm install -g @angular/cli`) for CLI commands outside npm scripts.

## 4. Application Bootstrap

The entry point (`src/main.ts`) bootstraps the standalone `AppComponent` and configures core providers:

- `provideRouter(routes)` wires the lazy-loaded route tree defined in `app.routes.ts`.
- `provideHttpClient(withInterceptorsFromDi())` registers HttpClient globally.
- `BrowserAnimationsModule` enables Angular animations.
- `AuthInterceptor` and `ErrorInterceptor` are attached via `HTTP_INTERCEPTORS` to enrich outbound requests and centralize error handling.

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(BrowserAnimationsModule),
    // ...interceptors
  ],
});
```

## 5. Routing & Navigation

All navigation is defined in `app.routes.ts` using Angular's standalone lazy-loading pattern:

- **Public routes:** `/home`, `/login`, `/register`, `/forgot-password`, `/reset-password`.
- **Authenticated routes:** `/books`, `/books/:id`, `/library`, `/social`, `/profile`.
- **Admin-only routes:** under `/admin` for dashboards, catalog management, reports, and statistics.

Guards (`AuthGuard`, `GuestGuard`, `AdminGuard`) enforce access rules by subscribing to the reactive `AuthStore` state. Unauthorized users are redirected to login or the home page as appropriate.

## 6. High-Level Folder Structure

```
src/app/
├── components/          # Feature and shared UI components
│   ├── admin/           # Admin dashboards, book/genre management, reports
│   ├── auth/            # Login/register/reset flows
│   ├── book/            # Catalog, details, filters, cards
│   ├── home/            # Landing experience
│   ├── library/         # Personal and public libraries, stats, reviews
│   ├── shared/          # Navbar, sliders, toasts, reusable widgets
│   ├── social/          # Friends, notifications, recommendations
│   └── user/            # Profile management
├── constants/           # Application-wide constants & enums
├── directives/          # Custom attribute directives (e.g. clickOutside)
├── guards/              # Route guards for auth/roles/guest routes
├── interceptors/        # HTTP interceptors for auth headers & error handling
├── models/              # TypeScript interfaces for API contracts
├── services/            # API clients, stores, event buses, error handler
├── utils/               # Helper utilities (e.g. slider logic + specs)
├── app.ts/.html/.css    # Root component shell
└── app.routes.ts        # Lazy-loaded route configuration
```

## 7. Component Architecture

The application embraces Angular's **standalone component** architecture:

- Each component declares its own `imports` array instead of relying on NgModules.
- Feature folders group `.ts`, `.html`, and `.css` files together for cohesion.
- Shared components (navbar, sliders, toast notifications) live in `components/shared` for reuse across features.
- Inputs/Outputs and service-injected observables handle component communication.

### Example: Book Catalog Feature

`BookCatalogComponent` orchestrates search filters, pagination, list rendering, and mobile filter toggling by delegating to child components (`book-filters`, `book-list`, `book-pagination`, `mobile-filter-toggle`). Interactions are event-driven via Outputs, keeping each component focused on a single responsibility.

## 8. Services & Data Flow

### 8.1 API Layer

- Feature-specific services (`BookApi`, `LibraryApi`, `UserApi`, `SocialApi`, `AdminApi`) direktno koriste Angular's `HttpClient` sa `environment.apiUrl` za base URL.
- `AuthInterceptor` automatski dodaje JWT token iz `localStorage` na sve HTTP zahteve.
- Servisi enkapsuliraju URL-ove endpointa i tipiziranje odgovora. Vraćaju tipizirane `Observable<T>` stream-ove, što pojednostavljuje upotrebu u komponentama.

### 8.2 Authentication Store

`AuthStore` maintains the authenticated user and token:

- Persists tokens/user profiles to `localStorage` under `booktracker_token` and `booktracker_user`.
- Exposes `currentUser$` and `isAuthenticated$` observables for reactive UI updates.
- Provides helpers (`isAdmin()`, `updateStoredUser()`, `logout()`) to manage session flow across the app.

### 8.3 Global HTTP Interceptors

- **AuthInterceptor:** attaches `Authorization: Bearer <token>` to outbound requests and logs out on `401` responses.
- **ErrorInterceptor:** normalizes API errors, filters out cases handled locally (e.g., login validation), and delegates rendering to the toast notification system via `ErrorHandler`.

### 8.4 Event Streams

- `LibraryEvents` publishes a `libraryUpdated$` stream so independent library components can react to changes without tight coupling.
- Other features follow similar patterns (e.g., RxJS `Subject` usage in filter components for debounced search).

## 9. Models & Type Safety

Interfaces under `src/app/models/` (e.g., `Book`, `Genre`, `PagedResponse`, `User`, `LibraryEntry`) mirror backend DTOs. Components and services rely on these types to enforce compile-time safety, making HTTP responses predictable and safer to refactor.

## 10. Styling & Theming

- Global styles live in `src/styles.scss` and leverage Bootstrap 5.3 utility classes.
- Component styles (`*.css` or `.scss`) are scoped by default, enabling feature-specific look & feel.
- Shared utilities such as the slider use dedicated styles to maintain consistent spacing, typography, and responsiveness.
- Mobile-first, responsive layouts are implemented across features (e.g., catalog mobile filters, touch-friendly pagination).

## 11. Forms & Validation

- Reactive forms (`FormGroup`, `FormControl`) handle complex flows like login, registration, profile editing, and admin management.
- Debounced search inputs (e.g., in `book-filters`) rely on RxJS to minimize network calls.
- Error messages are surfaced through the toast system or inline form hints depending on context.

## 12. Error & Notification UX

- `ErrorHandler` service aggregates toast messages in a `BehaviorSubject`.
- `ToastNotificationsComponent` subscribes to the message stream, rendering Bootstrap-styled toasts with icons, severity coloring, and auto-hide timers.
- Components can trigger success/info toasts through the same service, ensuring consistent user feedback.

## 13. Testing Strategy

- Angular CLI scaffolds Karma/Jasmine specs (e.g., `utils/slider.util.spec.ts`).
- Recommended approach:
  - Unit test pure functions and utilities with Jasmine.
  - Component tests should use Angular's TestBed with host components to assert template behavior.
  - Service tests can mock HttpClient via `HttpTestingController`.
- Run tests via `npm test`; configure CI to fail on coverage regressions if desired.

## 14. Deployment Considerations

- `ng build` produces a `/dist/booktracker-frontend` folder ready to serve via a static host (e.g., Nginx, Spring static resources, Azure Static Web Apps).
- Ensure `environment.ts` is swapped for `environment.prod.ts` (if created) using Angular's build configurations before deployment; currently only `production: false` is defined, so adding a prod environment file is advised.

## 15. Conventions & Best Practices

- Follow Angular style guide: feature folders, PascalCase components, camelCase services.
- Prefer Observables over Promises to leverage Angular's `async` pipes and reactive patterns.
- Keep components lean; push business logic into services or dedicated utilities.
- Use the existing interceptors and error-handling infrastructure for new API clients.
- Maintain strong typing by updating interfaces in `models/` when backend contracts evolve.

## 16. Suggested Enhancements

- Introduce `environment.prod.ts` with production API URLs and enable file replacements in `angular.json` builds.
- Expand unit test coverage beyond utilities, especially for guards and critical components.
- Consider adopting Angular signals or state management libraries (e.g., NgRx) if state complexity grows.
- Add end-to-end (E2E) tests with Cypress or Playwright to cover core user flows.
- Implement accessibility audits (ARIA labels, keyboard navigation) as outlined in `REFACTORING_SUMMARY.md` future enhancements.

---

For deeper explanations of cross-cutting systems (authentication, notifications, catalog flow, etc.), see `docs/system-deep-dives.md`.
