package com.booktracker.controller;

import com.booktracker.dto.BookRequest;
import com.booktracker.dto.BookResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.service.BookService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

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
        return book.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get most popular books
     */
    @GetMapping("/popular")
    public ResponseEntity<List<BookResponse>> getMostPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<BookResponse> books = bookService.getMostPopularBooks(limit);
        return ResponseEntity.ok(books);
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