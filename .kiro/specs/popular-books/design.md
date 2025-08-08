# Popular Books Feature Design Document

## Overview

The Popular Books feature adds a popularity tracking system to the existing Booktracker application by monitoring book detail page views and displaying the most popular books on the home tab. The system integrates seamlessly with the existing Spring Boot backend and Angular frontend architecture, using the current JPA/MySQL data layer and RESTful API patterns.

The feature introduces a new `BookView` entity to track view counts, extends existing services to handle popularity calculations, and adds a new section to the home page displaying the top 10 most viewed books. The implementation follows the existing architectural patterns and maintains consistency with the current codebase structure.

## Architecture

### Backend Architecture

The backend follows the existing layered architecture pattern:

```
Controller Layer (REST API)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Entity Layer (JPA Entities)
    ↓
MySQL Database
```

**New Components:**

- `BookView` entity for tracking view counts
- `BookViewRepository` for data access operations
- `PopularityService` for business logic
- Extensions to `BookController` for popularity endpoints
- Extensions to `AdminController` for statistics

### Frontend Architecture

The frontend maintains the existing Angular component structure:

```
Components (UI Layer)
    ↓
Services (HTTP Client Layer)
    ↓
Models (TypeScript Interfaces)
    ↓
Backend API
```

**New/Modified Components:**

- Enhanced `HomeComponent` with popular books section
- Extended `BookService` with popularity methods
- New `PopularBook` model interface
- Enhanced `AdminComponent` with popularity statistics

### Data Flow

1. **View Tracking Flow:**

   ```
   User clicks book → BookDetailComponent → BookService.getBookById()
   → BookController.getBookById() → PopularityService.recordView()
   → BookViewRepository.save() → Database
   ```

2. **Popular Books Display Flow:**
   ```
   HomeComponent.ngOnInit() → BookService.getPopularBooks()
   → BookController.getPopularBooks() → PopularityService.getMostPopular()
   → BookViewRepository.findMostPopular() → Database
   ```

## Components and Interfaces

### Backend Components

#### BookView Entity

```java
@Entity
@Table(name = "book_views")
public class BookView {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;
}
```

#### PopularityService Interface

```java
@Service
public class PopularityService {
    void recordBookView(Long bookId);
    List<BookResponse> getMostPopularBooks(int limit);
    List<BookResponse> getPopularityStatistics();
}
```

#### BookViewRepository Interface

```java
@Repository
public interface BookViewRepository extends JpaRepository<BookView, Long> {
    Optional<BookView> findByBookId(Long bookId);
    List<BookView> findTop10ByOrderByViewCountDesc();
    List<BookView> findAllByOrderByViewCountDesc();
}
```

### Frontend Components

#### PopularBook Model

```typescript
export interface PopularBook {
  id: number;
  title: string;
  author: string;
  thumbnail?: string;
  rating?: number;
  viewCount: number;
}
```

#### Enhanced BookService Methods

```typescript
export class BookService {
  getPopularBooks(limit: number = 10): Observable<Book[]>;
  recordBookView(bookId: number): Observable<void>;
}
```

The service will return `Book[]` objects with the optional `viewCount` property populated for popular books.

#### Popular Books Component Template

```html
<div class="popular-books-section">
  <h3>Most Popular Books</h3>
  <div class="popular-books-grid">
    <div *ngFor="let book of popularBooks" class="popular-book-card">
      <!-- Book display with title, author, thumbnail, rating -->
    </div>
  </div>
</div>
```

### API Endpoints

#### New Endpoints

- `GET /api/books/popular?limit={limit}` - Get most popular books
- `POST /api/books/{id}/view` - Record a book view (async)
- `GET /api/admin/popularity/statistics` - Get popularity statistics
- `GET /api/admin/popularity/export?format={csv|pdf}` - Export statistics

#### Modified Endpoints

- `GET /api/books/{id}` - Enhanced to trigger view recording

## Data Models

### Database Schema Changes

#### New Table: book_views

```sql
CREATE TABLE book_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    view_count BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    UNIQUE KEY unique_book_view (book_id)
);
```

#### Indexes for Performance

```sql
CREATE INDEX idx_book_views_view_count ON book_views(view_count DESC);
```

### Data Transfer Objects

#### Extended BookResponse

The existing `BookResponse` class will be extended to include popularity data when needed:

```java
public class BookResponse {
    // ... existing fields (id, title, author, publishedYear, thumbnail, description, genres)

    // New optional field for popularity data
    private Long viewCount;

    // Constructor for popular books with view count
    public BookResponse(Book book, Long viewCount) {
        this(book); // Call existing constructor
        this.viewCount = viewCount;
    }

    // Getter and setter for viewCount
    public Long getViewCount() { return viewCount; }
    public void setViewCount(Long viewCount) { this.viewCount = viewCount; }
}
```

This approach reuses the existing DTO structure while adding popularity information only when needed, maintaining consistency with the current codebase.

## Error Handling

### Backend Error Scenarios

1. **Book Not Found During View Recording**

   - Return 404 with meaningful error message
   - Log warning but don't fail the book detail page load

2. **Database Connection Issues**

   - Graceful degradation: return empty popular books list
   - Log error for monitoring
   - Cache last successful results when possible

3. **Concurrent View Updates**
   - Use optimistic locking or atomic operations
   - Handle race conditions gracefully

### Frontend Error Handling

1. **Popular Books Loading Failure**

   - Display fallback message: "Popular books temporarily unavailable"
   - Retry mechanism with exponential backoff
   - Don't block other home page content

2. **View Recording Failure**
   - Silent failure - don't interrupt user experience
   - Log error for debugging
   - Retry in background

### Error Response Format

```json
{
  "error": "BOOK_NOT_FOUND",
  "message": "Book with ID 123 not found",
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/books/123/view"
}
```

## Testing Strategy

### Backend Testing

#### Unit Tests

- `PopularityServiceTest`: Test business logic for view recording and retrieval
- `BookViewRepositoryTest`: Test custom query methods
- `BookControllerTest`: Test new popularity endpoints

#### Integration Tests

- `PopularityIntegrationTest`: Test complete flow from API to database
- `BookViewConcurrencyTest`: Test concurrent view updates
- `PopularityPerformanceTest`: Test query performance with large datasets

#### Test Data Setup

```java
@TestConfiguration
public class PopularityTestConfig {
    @Bean
    @Primary
    public PopularityService mockPopularityService() {
        // Mock service for testing
    }
}
```

### Frontend Testing

#### Unit Tests

- `BookService.spec.ts`: Test new popularity methods
- `HomeComponent.spec.ts`: Test popular books section rendering
- `PopularBooksComponent.spec.ts`: Test component behavior

#### Integration Tests

- `PopularBooksE2E.spec.ts`: Test complete user flow
- `BookViewTrackingE2E.spec.ts`: Test view recording functionality

#### Mock Data

```typescript
const mockPopularBooks: PopularBook[] = [
  { id: 1, title: "Test Book", author: "Test Author", viewCount: 100 },
];
```

### Performance Testing

#### Load Testing Scenarios

1. **High View Volume**: Simulate 1000+ concurrent book views
2. **Popular Books Query**: Test response time with 10,000+ books
3. **Database Performance**: Test query optimization with large datasets

#### Performance Metrics

- Popular books query: < 200ms response time
- View recording: < 100ms response time (async)
- Home page load: < 500ms with popular books section

### Mock Data Strategy

#### SQL Script for Manual Execution

```sql
-- Generate realistic view counts for existing books
INSERT INTO book_views (book_id, view_count)
SELECT
    b.id,
    FLOOR(RAND() * 1000) + 1 as view_count
FROM books b
ORDER BY RAND()
LIMIT 15;
```

#### Mock Data Distribution

- Top 3 books: 500-1000 views
- Next 7 books: 100-500 views
- Remaining 5 books: 10-100 views

This design ensures the Popular Books feature integrates seamlessly with the existing Booktracker architecture while providing a robust, scalable solution for tracking and displaying book popularity based on user engagement.
