# Technology Stack

## Backend

- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Security**: Spring Security with JWT authentication
- **Database**: MySQL 8.0 (production), H2 (testing)
- **ORM**: Spring Data JPA
- **Build Tool**: Maven 3.6+
- **Reporting**: JasperReports 6.20.6
- **Password Hashing**: BCrypt (via Spring Security)

## Frontend

- **Framework**: Angular 17
- **Language**: TypeScript 5.2
- **Styling**: Bootstrap 5.3.2 + SCSS
- **HTTP Client**: Angular HttpClient with RxJS 7.8
- **Testing**: Jasmine + Karma
- **Build Tool**: Angular CLI

## Development Tools

- **Package Management**: Maven (backend), npm (frontend)
- **Testing**: JUnit (backend), Jasmine/Karma (frontend)
- **Database**: MySQL Connector 8.0.33

## Common Commands

### Backend Development

```bash
cd backend

# Install dependencies and compile
mvn clean install

# Run development server
mvn spring-boot:run

# Run tests
mvn test

# Build for production
mvn clean package
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server (http://localhost:4200)
npm start

# Run tests
npm test

# Build for production
npm run build

# Watch mode for development
npm run watch
```

## Configuration Notes

- Backend runs on port 8080
- Frontend runs on port 4200 in development
- CORS is configured to allow frontend requests
- JWT tokens are used for authentication
- Database configuration is in `application.yml`
