# Backend System Deep Dives

This guide complements `backend-overview.md` by unpacking the more involved methods throughout the service and utility layers. Each section explains **what the method does**, **why it exists**, and **how the code flows**, using plain language aimed at college-level developers.

---

## 1. Authentication & Security

### `AuthService.register(RegisterRequest)`

1. Checks if the username already exists using `UserRepository.existsByUsername`.
2. Checks if the email is already registered to avoid duplicates.
3. Builds a new `User` entity, hashes the incoming password with the injected `PasswordEncoder`, and sets `isAdmin=false`.
4. Saves the user to MySQL via `userRepository.save`.
5. Wraps the outcome in an `AuthResponse`, returning user-friendly error messages on exceptions.

**Why:** Ensures unique credentials and enforces password hashing before persistence.

### `AuthService.login(LoginRequest)`

1. Uses Spring Security's `AuthenticationManager` to authenticate a username/email + password pair. Any mismatch triggers an exception.
2. Retrieves the matching `User` to access additional data (ID, avatar, admin flag).
3. Generates a JWT token via `jwtUtil.generateToken(username, userId)`.
4. Packs the token and user info into `AuthResponse` for the frontend to store.

**Why:** Combines security checks with token issuance so the frontend can maintain a stateless session.

### `AuthService.requestPasswordReset(PasswordResetDto)`

1. Looks up the user by email; if not found, it still returns success (prevents leaking which emails exist).
2. Generates a short-lived reset token with `JwtUtil.generatePasswordResetToken`.
3. Crafts a reset URL pointing to the Angular app and sends it via `JavaMailSender`.
4. Any mail issues are caught and reported back in `AuthResponse`.

**Why:** Provides a secure way to reset passwords while guarding against user enumeration.

### `AuthService.resetPassword(PasswordResetDto)`

1. Validates the token using `jwtUtil.validatePasswordResetToken` (checks signature and expiry).
2. Extracts the email from the token and loads the corresponding user.
3. Hashes the new password and saves the user.
4. Returns a success `AuthResponse` so the frontend can display confirmation.

**Why:** Finishes the password reset flow while ensuring the token is legitimate.

### `JwtUtil.generateToken(String username, Long userId)`

1. Creates a claims map containing `userId` and `username`.
2. Sets issued-at and expiration timestamps based on the configured TTL (`jwt.expiration`).
3. Signs the token with the shared secret using HS256.

**Why:** Produces tamper-proof tokens carrying minimal but sufficient user identity info.

### `JwtUtil.validateToken(String token, UserDetails userDetails)`

1. Extracts the username from the token and compares it with the `UserDetails` object.
2. Checks that the expiration timestamp is still in the future.
3. Catches parsing errors, returning `false` when the token is malformed or expired.

**Why:** Ensures each incoming request is truly from the authenticated user before hitting controllers.

### `AvatarStorageService.storeAvatar(Long userId, MultipartFile file)`

1. Validates the upload (not empty, <5 MB, allowed image MIME type).
2. Sanitizes the original filename to prevent path traversal or weird characters.
3. Builds a unique file name containing the user ID and timestamp, then saves it under `uploads/avatars/`.
4. Returns the public-facing path (`/uploads/avatars/...`) that gets stored in the database.

**Why:** Centralizes avatar handling with safety checks to avoid overwriting or storing dangerous files.

---

## 2. Book Catalog & Popularity

### `BookService.filterBooks(String title, String author, Long genreId, Integer publishedYear, ...)`

1. Builds a `Pageable` using page/size/sort parameters.
2. Delegates to `bookRepository.findBooksWithFilters(...)`, a custom query that applies whichever filters are non-null.
3. Transforms the `Page<Book>` into a `PagedResponse<BookResponse>` using stream mapping.

**Why:** Supports multi-criteria searches without forcing the frontend to send every parameter.

### `BookService.getSimilarBooks(Long bookId, int limit)`

1. Loads the target book and collects its genre IDs.
2. If the book has no genres, short-circuits with an empty list.
3. Queries `bookRepository.findSimilarBooks(...)` to find other books sharing those genres (excluding the original book).
4. Converts the matches into `BookResponse` DTOs.

**Why:** Powers the "Similar books" feature by reusing genre overlap logic.

### `PopularityService.recordBookView(Long bookId)`

1. Validates that the book exists; otherwise, throws `ResourceNotFoundException`.
2. Looks for an existing `BookView` row tied to the book ID.
3. If found, increments the `viewCount`; otherwise, creates a record with count = 1.
4. Wraps the entire block in a try/catch—failures are logged but do not break the main request (view counting is non-critical).

**Why:** Keeps a running tally of views for analytics without risking the browsing experience.

### `PopularityService.getMostPopularBooks(int limit)`

1. Fetches `BookView` records ordered by `viewCount`.
   - Uses an optimized method for the common case (`findTop10ByOrderByViewCountDesc`).
   - Falls back to streaming all records when `limit` > 10.
2. Maps each record to a `BookResponse`, attaching the view count.
3. Returns an empty list if anything goes wrong (fail-safe).

**Why:** Supplies administrators and the frontend with a ranking of popular books.

---

## 3. Library Management

### `LibraryService.addBookToLibrary(Long userId, UserBookRequest request)`

1. Validates the user exists (helper `validateAndFetchUser`).
2. Loads the requested `Book` entity.
3. Checks for duplicates with `userBookRepository.findByUserAndBook`; rejects if already present.
4. Creates a `UserBook` entry, copying status, rating, review, favorite flag, and read date from the request.
5. Auto-sets `readDate` to today if the status is `read` but no date was provided.
6. Saves the entry and fetches the book's average rating for display.
7. Returns a `UserBookResponse` containing the new entry plus average rating.

**Why:** Enforces unique library entries and ensures UX details (like auto-setting read dates) are consistent.

### `LibraryService.updateBookInLibrary(Long userId, Long userBookId, UserBookRequest request)`

1. Loads the `UserBook` row by ID.
2. Calls `validateUserBookOwnership` to ensure the row belongs to the requesting user.
3. Updates mutable fields: status, rating, review, read date, favorite flag.
4. Auto-sets `readDate` if the status just changed to `read` and no date exists yet.
5. Saves, recalculates the average rating, and returns a fresh `UserBookResponse`.

**Why:** Allows users to adjust progress/reviews while keeping the data consistent and secure.

### `LibraryService.removeBookFromLibrary(Long userId, Long userBookId)`

1. Checks the `UserBook` exists.
2. Confirms the owner matches `userId` to prevent deletions by other users.
3. Deletes the record.

**Why:** Provides a safe deletion path with ownership checks.

### `LibraryService.fetchBookRatings(List<UserBook> userBooks)` _(private helper)_

1. Collects all book IDs from the supplied library entries.
2. Leverages `userBookRepository.getAverageRatingsForBooks(bookIds)` to fetch averages in a single query (avoids N+1 lookups).
3. Builds a `Map<Long, Double>` of book ID → average rating for quick lookup.

**Why:** Efficiently hydrates rating data for paginated library queries.

### `LibraryService.getLibraryStats(Long userId)`

1. Counts total books, read/currently reading/to-read counts, and favorites using repository helpers.
2. Pulls the rating distribution (how many 1-star, 2-star, etc.) via a grouped query.
3. Calculates the overall average rating the user has given.
4. Packs everything into a `LibraryStatsResponse` for the frontend dashboard.

**Why:** Summarizes a user's reading habits without requiring multiple API calls.

### `LibraryService.getRecentActivity(Long userId, int limit)`

1. Retrieves the latest `UserBook` updates for the user.
2. Calls `fetchBookRatings` to attach average ratings to each entry.
3. Converts the list to `UserBookResponse` DTOs.

**Why:** Powers activity feeds showing what the user recently read or updated.

---

## 4. Social & Recommendations

### `FriendshipService.sendFriendRequest(Long userId, Long friendId)`

1. Rejects self-requests immediately.
2. Loads both users and ensures they exist.
3. Checks if a friendship already exists (accepted or pending). If a past request was rejected, it deletes that record to allow a new request.
4. Creates and saves a new `Friendship` with status `pending`.
5. Returns a `FriendshipResponse` tailored to the requester (indicates the other party and status).

**Why:** Prevents duplicate requests and provides a clean way to restart rejected connections.

### `FriendshipService.acceptFriendRequest(Long userId, Long friendshipId)`

1. Loads the `Friendship` entity; throws if not found.
2. Ensures the current user is the receiver (`friend`) of the pending request.
3. Verifies the status is still `pending`.
4. Switches the status to `accepted` and saves.
5. Returns a response reflecting the accepted friendship.

**Why:** Applies business rules—only recipients can accept, and only once.

### `RecommendationService.sendRecommendation(Long senderId, Long receiverId, Long bookId, String message)`

1. Loads sender, receiver, and book; each missing entity yields a `ResourceNotFoundException`.
2. Confirms the users are friends via `friendshipRepository.areFriends`.
3. Prevents duplicate recommendations for the same friend/book pair.
4. Builds and saves a `Recommendation` entity (message optional).
5. Returns a DTO with sender/receiver/book info and timestamps.

**Why:** Controls spam and ensures recommendations only happen between established friends.

### `RecommendationService.getRecentRecommendations(Long userId, int limit)`

1. Loads the user; throws if missing.
2. Uses a pageable query to fetch the latest recommendations.
3. Maps each `Recommendation` to a `RecommendationResponse` DTO.

**Why:** Supplies the social dashboard with real-time-ish recommendation data.

---

## 5. Reporting Pipeline

### `ReportService.getDailyActivityData(LocalDate startDate, LocalDate endDate)`

1. Iterates day-by-day between the provided dates.
2. For each day, queries repositories for counts: new users, books added, reviews posted, friend requests sent, recommendations sent.
3. Builds a `DailyActivityReportData` object per day and collects them into a list.

**Why:** Produces time-series data backing the daily activity report (and charts).

### `ReportService.getUserEngagementData()`

1. Computes aggregate metrics: total users, average books per user, books read/to-read, average rating, total reviews.
2. Creates a list of `UserEngagementReportData` objects where each entry corresponds to one dashboard card.

**Why:** Drives the admin engagement dashboard without heavy calculations on the frontend.

### `ReportService.generateReport(String reportName, List<?> data, String format, Map<String,Object> parameters)` _(private helper)_

1. Loads the `.jrxml` template from `resources/reports/`.
2. Compiles the template into a `JasperReport` object.
3. Wraps the provided list into a `JRBeanCollectionDataSource`.
4. Fills the template with the data + parameters to produce a `JasperPrint`.
5. Based on the requested format:
   - **PDF:** uses `JRPdfExporter` to write bytes.
   - **Excel/XLSX:** uses `JRXlsxExporter` with cell type detection.
   - **CSV:** delegates to `generateCsvReport` for custom handling (currently only popularity stats).
6. Returns the byte array to controllers; exceptions are wrapped in `JRException`.

**Why:** Centralizes JasperReports rendering so each export method only needs to supply data + parameters.

### `ReportService.buildUserEngagementDetails()` _(private helper)_

1. Calls a custom repository query `userRepository.getUserEngagementData()` that returns arrays of raw values per user.
2. Maps each row into a `UserEngagementReportData` object containing username, email, counts, averages.

**Why:** Feeds detailed datasets to Jasper templates that iterate over users (for downloadable reports).

---

## 6. Administrative Facade

### `AdminService.getAdminStats()`

1. Counts total users, books, and genres using repository calls optimized for aggregation.
2. Wraps counts into `AdminStatsResponseDto` for dashboard cards.

**Why:** Supplies a single endpoint that summarizes key metrics for the admin home screen.

### `AdminService.exportDailyActivityReport(LocalDate start, LocalDate end, String format)`

1. Delegates to `reportService.exportDailyActivityReport`, which pulls data and formats it.
2. Surfaces checked exceptions so the controller can return meaningful HTTP responses (e.g., 500 on failure).

**Why:** Keeps controllers thin—AdminService orchestrates all admin operations in one place.

---

## 7. Tips for Reading the Code

- **Follow the controller → service → repository path** for any feature. Controllers mostly validate inputs and delegate.
- **DTO constructors** (e.g., `new BookResponse(book)`) encapsulate how entities are presented to the frontend.
- **Transactional annotations** guard against partial updates; read-only methods use `@Transactional(readOnly = true)` for performance.
- **Exception messages** are crafted to be user-friendly where they bubble up (e.g., in auth responses).

When presenting, pick a few of these methods and walk through the numbered steps, referencing the corresponding files. That approach shows both your understanding of the business rules and your ability to navigate a Spring Boot codebase.
