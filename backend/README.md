# Booktracker Backend

Spring Boot backend for Booktracker.

## Tech stack

- Java 17
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA
- MySQL
- JasperReports

## API domains

- `/api/auth`
- `/api/users`
- `/api/books`
- `/api/library`
- `/api/genres`
- `/api/friends`
- `/api/recommendations`
- `/api/admin`

## Prerequisites

- JDK 17+
- Maven 3.9+
- MySQL running locally

## Configuration

Default configuration is in:

- `/home/runner/work/Booktracker/Booktracker/backend/src/main/resources/application.yml`

Before running outside local development, replace hardcoded credentials/secrets with environment-specific values.

## Run

```bash
cd /home/runner/work/Booktracker/Booktracker/backend
mvn spring-boot:run
```

The API runs on `http://localhost:8080` by default.

## Build and test

```bash
cd /home/runner/work/Booktracker/Booktracker/backend
mvn test
mvn package
```

If dependency resolution fails in restricted environments, verify internet/DNS access to required Maven artifact repositories.
