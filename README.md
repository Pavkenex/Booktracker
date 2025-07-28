# BookTracker Application

A comprehensive book management and social reading platform built with Spring Boot and Angular.

## Project Structure

```
booktracker/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/booktracker/
│   │   │   │       ├── BooktrackerApplication.java
│   │   │   │       └── config/
│   │   │   │           ├── CorsConfig.java
│   │   │   │           └── SecurityConfig.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   └── pom.xml
├── frontend/                # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   ├── main.ts
│   │   ├── index.html
│   │   └── styles.scss
│   ├── angular.json
│   ├── package.json
│   └── karma.conf.js
└── README.md
```

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0
- Maven 3.6+
- Angular CLI 17

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   mvn clean install
   ```

3. Configure MySQL database:
   - Create a database named `booktracker`
   - Update database credentials in `src/main/resources/application.yml`

4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:4200`

## Features

- User authentication and authorization
- Book catalog browsing and searching
- Personal library management
- Social features (friends, messaging)
- Admin dashboard and reporting
- Responsive design for mobile and desktop

## Technology Stack

### Backend
- Spring Boot 3
- Spring Security with JWT
- Spring Data JPA
- MySQL
- JasperReports
- BCrypt for password hashing

### Frontend
- Angular 17
- Bootstrap 5
- TypeScript
- RxJS
- Angular Router

## Development

### Running Tests

Backend:
```bash
cd backend
mvn test
```

Frontend:
```bash
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
mvn clean package
```

Frontend:
```bash
cd frontend
npm run build
```

## Configuration

### Database Configuration
Update `backend/src/main/resources/application.yml` with your database settings:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/booktracker
    username: your_username
    password: your_password
```

### CORS Configuration
The backend is configured to allow requests from `http://localhost:4200` by default. Update the CORS settings in `application.yml` for production deployment.

## API Documentation

The REST API will be available at `http://localhost:8080/api` with the following main endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/books/*` - Book catalog endpoints
- `/api/library/*` - Personal library endpoints
- `/api/collections/*` - Collection management endpoints
- `/api/friends/*` - Social features endpoints
- `/api/admin/*` - Administrative endpoints

## License

This project is licensed under the MIT License.