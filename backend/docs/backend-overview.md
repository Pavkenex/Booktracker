# Booktracker Backend Documentation

## 1. Project Overview

The Booktracker backend is a Spring Boot 3 application that exposes a REST API for authentication, book discovery, personal libraries, social features, and administrative reporting. It persists data in MySQL (with an H2 profile for demos/tests), issues JWT access tokens for stateless security, and produces JasperReports-based analytics for administrators.

Core goals:

- Provide a secure gateway for the Angular frontend and any future clients.
- Model books, genres, users, libraries, friendships, and recommendations with clear JPA entities.
- Expose business logic through service-layer abstractions and controller endpoints.
- Support role-based flows (regular users vs administrators) plus reporting and popularity tracking.

## 2. Tech Stack & Key Dependencies

| Area             | Details                                                     |
| ---------------- | ----------------------------------------------------------- |
| Language         | Java 17                                                     |
| Framework        | Spring Boot 3.2 (Web, Security, Data JPA, Validation, Mail) |
| Persistence      | MySQL (runtime), H2 (alternate profile), Spring Data JPA    |
| Authentication   | Spring Security + JWT (io.jsonwebtoken 0.11.5)              |
| Reporting        | JasperReports 6.20.6 (PDF, XLSX, CSV exports)               |
| Build Tool       | Maven (Spring Boot Maven Plugin)                            |
| Testing          | JUnit + Spring Boot Test + Spring Security Test             |
| Async/Background | Spring `@EnableAsync` for future async tasks                |

See `pom.xml` for the full dependency graph.

## 3. Directory Layout

```
src/main/java/com/booktracker
├── BooktrackerApplication.java        # Spring Boot entry point
├── config/                            # CORS, security, mail configuration
├── controller/                        # REST controllers (Auth, Books, Library, Social, Admin)
├── dto/                               # Request/response DTOs
├── entity/                            # JPA entities and enums
├── exception/                         # Custom exceptions & handlers
├── repository/                        # Spring Data repositories
├── security/                          # JWT utilities, filters, user details service
├── service/                           # Business logic across domains
└── util/                              # Helpers (pagination, date utilities, etc.)
```

Templates and SQL seeds live under `src/main/resources/`:

- `application.yml` (MySQL default) and `application-h2.yml` (in-memory profile)
- SQL files for seed data and mock book views
- Jasper report templates (`reports/*.jrxml`)

## 4. Configuration & Profiles

- **Default profile (`application.yml`)**: connects to MySQL, enables Gmail SMTP, defines JWT secret/expiration, and configures avatar upload folder (`uploads/avatars`).
- **H2 profile (`application-h2.yml`)**: switches to an in-memory H2 database, exposes the H2 console, and sets `server.servlet.context-path=/api`.

Activate a profile with `--spring.profiles.active=h2` or by setting the `SPRING_PROFILES_ACTIVE` environment variable. Externalize credentials such as DB passwords and mail accounts when deploying.

## 5. Build & Run Commands

### Prerequisites

- Java 17 SDK
- Maven 3.9+
- MySQL 8 (if using the default profile)

### Commands (run from `backend/`)

```powershell
mvn clean install          # compile and run unit tests
mvn spring-boot:run        # start the API with the default profile
mvn spring-boot:run -Dspring-boot.run.profiles=h2   # start with in-memory H2
mvn test                   # execute the backend test suite
```

The API listens on `http://localhost:8080` unless overridden. With the H2 profile, the base path becomes `http://localhost:8080/api` because of the context path setting.

## 6. Security Overview

- Login, registration, and password reset live in `AuthController`/`AuthService`.
- JWT tokens are generated via `JwtUtil` and validated by `JwtAuthenticationFilter` before controller logic executes.
- The `User` entity includes a boolean `isAdmin`. Admin endpoints check this flag either within service methods or via controller guards.
- Passwords are hashed with BCrypt; the hash is never returned to clients.

## 7. Domain Services

| Service                 | Responsibility Highlights                                                      |
| ----------------------- | ------------------------------------------------------------------------------ |
| `AuthService`           | Register/login users, manage tokens, send reset emails                         |
| `BookService`           | Search/filter books, CRUD for admins, track popularity via `PopularityService` |
| `LibraryService`        | Manage per-user library entries, compute stats, handle favorites/reviews       |
| `FriendshipService`     | Friend requests, accept/reject, mutual friends                                 |
| `RecommendationService` | Send/dismiss book recommendations between friends                              |
| `PopularityService`     | Track book view counts and produce popularity rankings                         |
| `ReportService`         | Aggregate data and pipe it into JasperReports exports                          |
| `UserService`           | Profile updates, password changes, avatar management                           |
| `AvatarStorageService`  | Validate, store, and delete avatar images safely                               |

Each service is transactional to ensure data consistency across repository operations.

## 8. REST Endpoint Summary

| Controller                 | Base Path          | Examples                                                           |
| -------------------------- | ------------------ | ------------------------------------------------------------------ |
| `AuthController`           | `/auth`            | POST `/login`, `/register`, `/forgot-password`, `/reset-password`  |
| `BookController`           | `/books`           | GET `/`, `/filter`, `/popular`, `/similar/{id}`, POST `/{id}/view` |
| `GenreController`          | `/genres`          | GET `/` (public), admin-only POST/PUT/DELETE                       |
| `LibraryController`        | `/library`         | CRUD library entries, stats, favorites, reviews                    |
| `FriendshipController`     | `/friends`         | POST `/request`, PUT `/request/{id}`, DELETE `/{friendId}`         |
| `RecommendationController` | `/recommendations` | GET `/received`, `/sent`, POST `/`, PUT `/{id}/read`               |
| `NotificationController`   | `/notifications`   | GET `/count` for social polling                                    |
| `AdminController`          | `/admin`           | Dashboard metrics, CRUD proxies, report exports                    |
| `UserController`           | `/users`           | GET `/profile`, PUT `/profile`, POST `/profile/avatar`, admin list |

Refer to controller classes for full signatures and expected payloads.

## 9. Persistence Model

- `User`, `Book`, `Genre`, `UserBook`, `Friendship`, `Recommendation`, `BookView` are the primary entities.
- Spring Data repositories expose query methods (including custom JPQL/native queries) for pagination, filtering, and metrics.
- `UserBook` acts as an association entity (many-to-many between `User` and `Book`) with extra fields like `status`, `rating`, `review`, `readDate`, and `isFavourite`.

## 10. Reporting Pipeline

`ReportService` aggregates domain data, then uses JasperReports templates residing under `resources/reports/`. Supported formats:

- PDF and XLSX (via Jasper exporters)
- CSV (custom writer for the popularity report)

Admin endpoints in `AdminController` forward format selections to `ReportService`, returning the file bytes to the frontend.

## 11. Logging & Error Handling

- `com.booktracker` and `org.springframework.security` are set to DEBUG by default for easier development troubleshooting.
- Services favor defensive programming: catching exceptions where appropriate and returning meaningful error messages (`AuthResponse`, `UserProfileResponse`, etc.).
- Custom exceptions like `ResourceNotFoundException` bubble up to controllers, which translate them into HTTP status codes via Spring’s exception handling.

## 12. Recommended Next Steps

- Move secrets (mail password, DB password, JWT secret) out of source control.
- Add integration tests covering critical flows (auth, library updates, recommendations).
- Standardize API error responses with a global `@ControllerAdvice`.
- Consider database migrations with Flyway or Liquibase for consistent schema evolution.
- Evaluate introducing scheduled tasks or message queues for email/report exports if those workloads grow.

Use this document as the big-picture guide when presenting the backend. Deep explanations of complex methods and subsystem walkthroughs live in `backend/docs/backend-system-deep-dives.md`.
