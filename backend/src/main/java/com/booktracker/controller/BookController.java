package com.booktracker.controller;

import com.booktracker.dto.BookRequest;
import com.booktracker.dto.BookResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.service.BookService;
import com.booktracker.service.PopularityService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    private static final Logger logger = LoggerFactory.getLogger(BookController.class);

    @Autowired
    private BookService bookService;

    @Autowired
    private PopularityService popularityService;

    /**
     * Get all books with pagination and sorting
     */
    @GetMapping
    public ResponseEntity<PagedResponse<BookResponse>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        PagedResponse<BookResponse> books = bookService.getAllBooks(page, size, sortBy, sortDir);
        return ResponseEntity.ok(books);
    }

    /**
     * Search books by title or author
     */
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<BookResponse>> searchBooks(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        PagedResponse<BookResponse> books = bookService.searchBooks(q, page, size, sortBy, sortDir);
        return ResponseEntity.ok(books);
    }

    /**
     * Filter books with multiple criteria
     */
    @GetMapping("/filter")
    public ResponseEntity<PagedResponse<BookResponse>> filterBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Long genreId,
            @RequestParam(required = false) Integer publishedYear,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        PagedResponse<BookResponse> books = bookService.filterBooks(
            title, author, genreId, publishedYear, page, size, sortBy, sortDir);
        return ResponseEntity.ok(books);
    }

    /**
     * Get books by genre
     */
    @GetMapping("/genre/{genreId}")
    public ResponseEntity<PagedResponse<BookResponse>> getBooksByGenre(
            @PathVariable Long genreId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        PagedResponse<BookResponse> books = bookService.getBooksByGenre(genreId, page, size, sortBy, sortDir);
        return ResponseEntity.ok(books);
    }

    /**
     * Get book details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        Optional<BookResponse> book = bookService.getBookById(id);
        
        // If book exists, record the view asynchronously
        if (book.isPresent()) {
            try {
                recordBookViewAsync(id);
                logger.debug("Initiated async view recording for book detail page, book ID: {}", id);
            } catch (Exception e) {
                // Log error but don't let view recording failure affect the book detail response
                logger.error("Failed to initiate view recording for book ID: {}", id, e);
            }
        }
        
        return book.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get similar books by shared genres
     */
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<BookResponse>> getSimilarBooks(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit) {
        if (limit <= 0) limit = 10;
        if (limit > 50) limit = 50; // simple cap
        List<BookResponse> similar = bookService.getSimilarBooks(id, limit);
        return ResponseEntity.ok(similar);
    }

    /**
     * Get most popular books based on view count
     */
    @GetMapping("/popular")
    public ResponseEntity<List<BookResponse>> getMostPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            // Validate limit parameter
            if (limit <= 0) {
                logger.warn("Invalid limit parameter: {}", limit);
                return ResponseEntity.badRequest().build();
            }
            
            if (limit > 100) {
                logger.warn("Limit parameter too large: {}, capping at 100", limit);
                limit = 100;
            }
            
            List<BookResponse> books = popularityService.getMostPopularBooks(limit);
            logger.debug("Retrieved {} popular books", books.size());
            return ResponseEntity.ok(books);
            
        } catch (Exception e) {
            logger.error("Error retrieving popular books", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Record a book view asynchronously
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordBookView(@PathVariable Long id) {
        try {
            // Validate book ID
            if (id == null || id <= 0) {
                logger.warn("Invalid book ID for view recording: {}", id);
                return ResponseEntity.badRequest().build();
            }
            
            // Record view asynchronously to avoid blocking the request
            recordBookViewAsync(id);
            
            logger.debug("Initiated async view recording for book ID: {}", id);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            logger.error("Error initiating view recording for book ID: {}", id, e);
            // Return success even if view recording fails to not break user experience
            return ResponseEntity.ok().build();
        }
    }

    /**
     * Asynchronous method to record book view
     */
    @Async
    public CompletableFuture<Void> recordBookViewAsync(Long bookId) {
        try {
            popularityService.recordBookView(bookId);
            logger.debug("Successfully recorded view for book ID: {}", bookId);
        } catch (Exception e) {
            logger.error("Failed to record view for book ID: {}", bookId, e);
            // Don't rethrow - view recording should not break the main functionality
        }
        return CompletableFuture.completedFuture(null);
    }

    /**
     * Get recently added books
     */
    @GetMapping("/recent")
    public ResponseEntity<List<BookResponse>> getRecentlyAddedBooks(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<BookResponse> books = bookService.getRecentlyAddedBooks(limit);
        return ResponseEntity.ok(books);
    }

    /**
     * Get total book count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalBookCount() {
        long count = bookService.getTotalBookCount();
        return ResponseEntity.ok(count);
    }

    /**
     * Create a new book (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequest bookRequest) {
        BookResponse createdBook = bookService.createBook(bookRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
    }

    /**
     * Update an existing book (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest bookRequest) {
        
        Optional<BookResponse> updatedBook = bookService.updateBook(id, bookRequest);
        return updatedBook.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete a book (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        boolean deleted = bookService.deleteBook(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}