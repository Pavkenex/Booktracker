# Project Structure

## Root Directory Layout

```
booktracker/
├── backend/                 # Spring Boot backend application
├── frontend/                # Angular frontend application
└── README.md               # Project documentation
```

## Backend Structure (`backend/`)

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/booktracker/
│   │   │   ├── BooktrackerApplication.java    # Main application class
│   │   │   ├── config/                        # Configuration classes
│   │   │   ├── controller/                    # REST API controllers
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   ├── entity/                       # JPA entities
│   │   │   ├── exception/                    # Custom exceptions & handlers
│   │   │   ├── repository/                   # Data access layer
│   │   │   ├── security/                     # JWT & authentication
│   │   │   ├── service/                      # Business logic layer
│   │   │   └── util/                         # Utility classes
│   │   └── resources/
│   │       ├── application.yml               # Main configuration
│   │       ├── application-h2.yml            # H2 test configuration
│   │       ├── data.sql                      # Sample data
│   │       └── reports/                      # JasperReports templates
│   └── test/                                 # Test classes
└── pom.xml                                   # Maven configuration
```

## Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/                       # Angular components
│   │   │   ├── admin/                        # Admin dashboard components
│   │   │   ├── auth/                         # Authentication components
│   │   │   ├── book/                         # Book-related components
│   │   │   ├── home/                         # Home page components
│   │   │   ├── library/                      # Library management components
│   │   │   ├── shared/                       # Reusable components
│   │   │   └── social/                       # Social features components
│   │   ├── directives/                       # Custom Angular directives
│   │   ├── guards/                           # Route guards
│   │   ├── interceptors/                     # HTTP interceptors
│   │   ├── models/                           # TypeScript interfaces/models
│   │   ├── services/                         # Angular services
│   │   ├── utils/                            # Utility functions
│   │   ├── app.component.ts                  # Root component
│   │   └── app.routes.ts                     # Routing configuration
│   ├── assets/                               # Static assets
│   ├── environments/                         # Environment configurations
│   ├── index.html                            # Main HTML file
│   ├── main.ts                               # Application bootstrap
│   └── styles.scss                           # Global styles
├── angular.json                              # Angular CLI configuration
├── package.json                              # npm dependencies
└── karma.conf.js                             # Test configuration
```

## Architecture Patterns

### Backend (Spring Boot)

- **Layered Architecture**: Controller → Service → Repository → Entity
- **Package by Feature**: Each domain (auth, book, library, etc.) has its own controllers, services, and repositories
- **DTO Pattern**: Separate request/response objects from entities
- **Global Exception Handling**: Centralized error handling with custom exceptions

### Frontend (Angular)

- **Component-Based Architecture**: Organized by feature modules
- **Service Layer**: Business logic and HTTP communication
- **Guard Pattern**: Route protection with authentication guards
- **Interceptor Pattern**: HTTP request/response processing
- **Reactive Programming**: RxJS for asynchronous operations

## Key Conventions

- Backend package naming: `com.booktracker.{layer}.{feature}`
- Frontend component naming: `{feature}-{component}.component.ts`
- API endpoints follow REST conventions: `/api/{resource}`
- Database entities use JPA annotations
- DTOs separate request/response models from entities
- Services handle business logic, controllers handle HTTP concerns
