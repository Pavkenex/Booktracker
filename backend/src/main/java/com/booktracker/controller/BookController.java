package com.booktracker.controller;

import com.booktracker.dto.BookRequestDto;
import com.booktracker.dto.BookResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.service.BookService;
import com.booktracker.service.PopularityService;
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
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private PopularityService popularityService;

    
    @GetMapping
    public ResponseEntity<PagedResponse<BookResponse>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        PagedResponse<BookResponse> books = bookService.getAllBooks(page, size, sortBy, sortDir);
        return ResponseEntity.ok(books);
    }

    
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

    
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        Optional<BookResponse> book = bookService.getBookById(id);
        
        return book.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<BookResponse>> getSimilarBooks(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit) {
        if (limit <= 0) limit = 10;
    if (limit > 50) limit = 50;
        List<BookResponse> similar = bookService.getSimilarBooks(id, limit);
        return ResponseEntity.ok(similar);
    }

    
    @GetMapping("/popular")
    public ResponseEntity<List<BookResponse>> getMostPopularBooks(
            @RequestParam(defaultValue = "10") int limit) {
        
        if (limit <= 0) {
            throw new IllegalArgumentException("Limit must be greater than 0");
        }
        
        if (limit > 100) {
            limit = 100;
        }
        
        List<BookResponse> books = popularityService.getMostPopularBooks(limit);
        return ResponseEntity.ok(books);
    }

    
    @PostMapping("/{id}/view")
    public ResponseEntity<Void> recordBookView(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid book ID");
        }
        
        popularityService.recordBookViewAsync(id);
        return ResponseEntity.ok().build();
    }

    
    @GetMapping("/recent")
    public ResponseEntity<List<BookResponse>> getRecentlyAddedBooks(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<BookResponse> books = bookService.getRecentlyAddedBooks(limit);
        return ResponseEntity.ok(books);
    }

    
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalBookCount() {
        long count = bookService.getTotalBookCount();
        return ResponseEntity.ok(count);
    }

    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequestDto bookRequest) {
        BookResponse createdBook = bookService.createBook(bookRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBook);
    }

    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequestDto bookRequest) {
        
        Optional<BookResponse> updatedBook = bookService.updateBook(id, bookRequest);
        return updatedBook.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}
