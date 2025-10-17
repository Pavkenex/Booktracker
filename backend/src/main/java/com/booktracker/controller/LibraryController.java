package com.booktracker.controller;

import com.booktracker.dto.BookInLibraryCheckResponse;
import com.booktracker.dto.LibraryStatsResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.dto.UserBookRequest;
import com.booktracker.dto.UserBookResponse;
import com.booktracker.entity.UserBook;
import com.booktracker.service.LibraryService;
import com.booktracker.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = "http://localhost:4200")
public class LibraryController {
    
    private final LibraryService libraryService;
    private final SecurityUtils securityUtils;
    
    public LibraryController(LibraryService libraryService, SecurityUtils securityUtils) {
        this.libraryService = libraryService;
        this.securityUtils = securityUtils;
    }
    
    
    @PostMapping("/books")
    public ResponseEntity<UserBookResponse> addBookToLibrary(@Valid @RequestBody UserBookRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        UserBookResponse response = libraryService.addBookToLibrary(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    
    @PutMapping("/books/{userBookId}")
    public ResponseEntity<UserBookResponse> updateBookInLibrary(
            @PathVariable Long userBookId,
            @Valid @RequestBody UserBookRequest request) {
        Long userId = securityUtils.getCurrentUserId();
        UserBookResponse response = libraryService.updateBookInLibrary(userId, userBookId, request);
        return ResponseEntity.ok(response);
    }
    
    
    @DeleteMapping("/books/{userBookId}")
    public ResponseEntity<Void> removeBookFromLibrary(@PathVariable Long userBookId) {
        Long userId = securityUtils.getCurrentUserId();
        libraryService.removeBookFromLibrary(userId, userBookId);
        return ResponseEntity.ok().build();
    }
    
    
    @GetMapping
    public ResponseEntity<PagedResponse<UserBookResponse>> getUserLibrary(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Long userId = securityUtils.getCurrentUserId();
        Page<UserBookResponse> libraryPage = libraryService.getUserLibrary(userId, page, size, sortBy, sortDir);
        PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/status/{status}")
    public ResponseEntity<PagedResponse<UserBookResponse>> getUserLibraryByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Long userId = securityUtils.getCurrentUserId();
        UserBook.ReadingStatus readingStatus = UserBook.ReadingStatus.valueOf(status.toUpperCase());
        Page<UserBookResponse> libraryPage = libraryService.getUserLibraryByStatus(
                userId, readingStatus, page, size, sortBy, sortDir);
        PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/favorites")
    public ResponseEntity<PagedResponse<UserBookResponse>> getUserFavoriteBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Long userId = securityUtils.getCurrentUserId();
        Page<UserBookResponse> favoritesPage = libraryService.getUserFavoriteBooks(userId, page, size, sortBy, sortDir);
        PagedResponse<UserBookResponse> response = new PagedResponse<>(favoritesPage);
        return ResponseEntity.ok(response);
    }
    
    
    @PutMapping("/books/{userBookId}/favorite")
    public ResponseEntity<UserBookResponse> toggleFavorite(@PathVariable Long userBookId) {
        Long userId = securityUtils.getCurrentUserId();
        UserBookResponse response = libraryService.toggleFavorite(userId, userBookId);
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/stats")
    public ResponseEntity<LibraryStatsResponse> getLibraryStats() {
        Long userId = securityUtils.getCurrentUserId();
        LibraryStatsResponse stats = libraryService.getLibraryStats(userId);
        return ResponseEntity.ok(stats);
    }
    
    
    @GetMapping("/books/{userBookId}")
    public ResponseEntity<UserBookResponse> getUserBook(@PathVariable Long userBookId) {
        Long userId = securityUtils.getCurrentUserId();
        UserBookResponse response = libraryService.getUserBook(userId, userBookId);
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/books/check/{bookId}")
    public ResponseEntity<BookInLibraryCheckResponse> checkBookInLibrary(@PathVariable Long bookId) {
        Long userId = securityUtils.getCurrentUserId();
        UserBookResponse userBook = libraryService.getUserBookByBookId(userId, bookId);
        
        boolean hasBook = userBook != null;
        return ResponseEntity.ok(new BookInLibraryCheckResponse(hasBook, userBook));
    }
    
    
    @GetMapping("/recent")
    public ResponseEntity<List<UserBookResponse>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        Long userId = securityUtils.getCurrentUserId();
        List<UserBookResponse> recentActivity = libraryService.getRecentActivity(userId, limit);
        return ResponseEntity.ok(recentActivity);
    }

    
    @GetMapping("/book/{bookId}/reviews")
    public ResponseEntity<PagedResponse<UserBookResponse>> getBookReviews(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Page<UserBookResponse> reviewPage = libraryService.getBookReviews(bookId, page, size);
        PagedResponse<UserBookResponse> response = new PagedResponse<>(reviewPage);
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<PagedResponse<UserBookResponse>> getUserPublicLibrary(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Page<UserBookResponse> libraryPage = libraryService.getUserLibrary(userId, page, size, sortBy, sortDir);
        PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
        
        return ResponseEntity.ok(response);
    }
}
