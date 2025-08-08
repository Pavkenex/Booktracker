# Implementation Plan

- [x] 1. Create database schema and entity for book view tracking

  - Create the `book_views` table with `id`, `book_id`, and `view_count` columns
  - Implement the `BookView` JPA entity with proper relationships to `Book`
  - Add database index for performance on `view_count` column
  - _Requirements: 2.2, 3.4_

-

- [x] 2. Implement BookView repository with custom queries

  - Create `BookViewRepository` interface extending `JpaRepository`
  - Implement `findByBookId()` method for retrieving view data by book
  - Implement `findTop10ByOrderByViewCountDesc()` for getting most popular books
  - Write unit tests for repository methods
  - _Requirements: 2.1, 2.2, 1.2_

- [x] 3. Create PopularityService for business logic

  - Implement `PopularityService` class with view recording functionality
  - Add `recordBookView(Long bookId)` method with atomic increment logic
  - Add `getMostPopularBooks(int limit)` method returning `BookResponse` objects
  - Add `getPopularityStatistics()` method for admin functionality
  - Handle edge cases like non-existent books gracefully
  - Write comprehensive unit tests for service methods
  - _Requirements: 2.1, 2.2, 2.5, 4.2_

- [x] 4. Extend BookController with popularity endpoints

  - Add `POST /api/books/{id}/view` endpoint for recording book views
  - Add `GET /api/books/popular?limit={limit}` endpoint for retrieving popular books
  - Implement asynchronous view recording to avoid blocking book detail requests
  - Add proper error handling and HTTP status codes
  - Write integration tests for new endpoints
  - _Requirements: 2.1, 2.4, 1.4_

- [x] 5. Integrate view tracking with existing book detail functionality

  - Modify existing `getBookById` method in `BookController` to trigger view recording
  - Ensure view recording happens asynchronously and doesn't affect response time
  - Add error handling so view recording failures don't break book detail page
  - Test integration with existing book detail functionality
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 6. Extend existing BookResponse DTO with popularity data

  - Add optional `viewCount` field to existing `BookResponse` class
  - Add new constructor that accepts `Book` and `viewCount` parameters
  - Ensure backward compatibility with existing code that uses `BookResponse`
  - Update service methods to use extended DTO when returning popular books
  - _Requirements: 1.3, 4.2_

-

- [x] 7. Create admin endpoints for popularity statistics

  - Add `GET /api/admin/popularity/statistics` endpoint in `AdminController`
  - Add `GET /api/admin/popularity/export?format={csv|pdf}` endpoint for data export
  - Implement CSV export functionality using existing patterns
  - Implement PDF export using JasperReports following existing admin report patterns
  - Handle empty data scenarios with appropriate messages
  - Write tests for admin endpoints
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

-

- [x] 8. Extend existing frontend Book model with popularity data

  - Add optional `viewCount` property to existing `Book` interface in `book.model.ts`
  - Ensure backward compatibility with existing code that uses Book interface
  - Update TypeScript interfaces to handle optional popularity data
  - _Requirements: 1.3, 1.4_

- [x] 9. Extend BookService with popularity methods

- [ ] 9. Extend BookService with popularity methods

  - Add `getPopularBooks(limit: number)` method returning `Observable<Book[]>` with viewCount
  - Add `recordBookView(bookId: number)` method for explicit view tracking
  - Implement proper error handling and HTTP client patterns
  - Add unit tests for new service methods
  - _Requirements: 1.1, 1.2, 2.1_

-

- [x] 10. Create popular books section component

  - Create reusable component for displaying popular books list
  - Implement loading states and error handling
  - Add responsive design following existing UI patterns
  - Include book thumbnails, titles, authors, and ratings in display
  - Handle empty state when no popular books are available
  - Write component unit tests

  --_Requirements: 1.1, 1.2, 1.3, 1.5, 1.6_

- [x] 11. Integrate popular books section into home page

  - Add popular books section to `HomeComponent` template
  - Load popular books data on component initialization
  - Implement proper loading indicators and error states
  - Ensure section integrates well with existing home page

layout

- Add click handlers for navigating to book detail pages
  --Test complete user flow from home page to book details

--_Requirements: 1.1, 1.2, 1.4, 1.6_

- [x] 12. Implement view tracking in book detail component

  - Modify book detail component to trigger view recording when book is loaded
  - Ensure view recording is called only once per page visit
  - Handle view recording errors silently without affectin
    g user experience
  - Test that views are properly recorded when users visit book detail pages
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 13. Create admin interface for popularity statistics

  - Add popularity statistics link to admin dashboard navigation
  - Create component for displaying book popularity statistics table
  - Implement sorting and filtering capabilities for statistics view
  - Add export buttons for CSV and PDF formats
  - Handle loading states and empty data scenarios
  - Write tests for admin popularity components
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

-

- [x] 14. Generate and execute mock data SQL script

  - Create SQL script to populate `book_views` table with realistic test data
  - Ensure script references only existing books from the `books` table
  - Generate varied view counts to create realistic popularity distribution
  - Document script execution instructions for manual database setup
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 15. Write comprehensive integration tests

  - Create end-to-end tests for complete popular books workflow
  - Test view recording and popular books display integration
  - Test admin statistics and export functionality
  - Verify error handling and edge cases work correctly
  - Test performance with realistic data volumes
  - _Requirements: All requirements verification_

- [ ] 16. Add error handling and performance optimizations
  - Implement proper exception handling throughout the feature
  - Add database query optimization and caching where appropriate
  - Ensure asynchronous operations don't block user interface
  - Add logging for monitoring and debugging purposes
  - Verify all performance requirements are met
  - _Requirements: 2.4, 2.5, 1.6_
