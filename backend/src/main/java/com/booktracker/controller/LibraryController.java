package com.booktracker.controller;

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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    
    /**
     * Add a book to user's library
     */
    @PostMapping("/books")
    public ResponseEntity<Map<String, Object>> addBookToLibrary(@Valid @RequestBody UserBookRequest request) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            UserBookResponse response = libraryService.addBookToLibrary(userId, request);
            return createSuccessResponse("Book added to library successfully", response, HttpStatus.CREATED);
        });
    }
    
    /**
     * Update a book in user's library
     */
    @PutMapping("/books/{userBookId}")
    public ResponseEntity<Map<String, Object>> updateBookInLibrary(
            @PathVariable Long userBookId,
            @Valid @RequestBody UserBookRequest request) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            UserBookResponse response = libraryService.updateBookInLibrary(userId, userBookId, request);
            return createSuccessResponse("Book updated successfully", response, HttpStatus.OK);
        });
    }
    
    /**
     * Remove a book from user's library
     */
    @DeleteMapping("/books/{userBookId}")
    public ResponseEntity<Map<String, Object>> removeBookFromLibrary(@PathVariable Long userBookId) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            libraryService.removeBookFromLibrary(userId, userBookId);
            return createSuccessResponse("Book removed from library successfully", null, HttpStatus.OK);
        });
    }
    
    /**
     * Get user's library with pagination
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserLibrary(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            Page<UserBookResponse> libraryPage = libraryService.getUserLibrary(userId, page, size, sortBy, sortDir);
            PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
            return createSuccessResponse(null, response, HttpStatus.OK);
        });
    }
    
    /**
     * Get user's library by reading status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Map<String, Object>> getUserLibraryByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            UserBook.ReadingStatus readingStatus = UserBook.ReadingStatus.valueOf(status.toUpperCase());
            Page<UserBookResponse> libraryPage = libraryService.getUserLibraryByStatus(
                    userId, readingStatus, page, size, sortBy, sortDir);
            PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
            return createSuccessResponse(null, response, HttpStatus.OK);
        });
    }
    
    /**
     * Get user's favorite books
     */
    @GetMapping("/favorites")
    public ResponseEntity<Map<String, Object>> getUserFavoriteBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            Page<UserBookResponse> favoritesPage = libraryService.getUserFavoriteBooks(userId, page, size, sortBy, sortDir);
            PagedResponse<UserBookResponse> response = new PagedResponse<>(favoritesPage);
            return createSuccessResponse(null, response, HttpStatus.OK);
        });
    }
    
    /**
     * Toggle favorite status of a book
     */
    @PutMapping("/books/{userBookId}/favorite")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@PathVariable Long userBookId) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            UserBookResponse response = libraryService.toggleFavorite(userId, userBookId);
            return createSuccessResponse("Favorite status updated successfully", response, HttpStatus.OK);
        });
    }
    
    /**
     * Get library statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLibraryStats() {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            LibraryStatsResponse stats = libraryService.getLibraryStats(userId);
            return createSuccessResponse(null, stats, HttpStatus.OK);
        });
    }
    
    /**
     * Get a specific book from user's library
     */
    @GetMapping("/books/{userBookId}")
    public ResponseEntity<Map<String, Object>> getUserBook(@PathVariable Long userBookId) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            UserBookResponse response = libraryService.getUserBook(userId, userBookId);
            return createSuccessResponse(null, response, HttpStatus.OK);
        });
    }
    
    /**
     * Check if user has a book in their library
     */
    @GetMapping("/books/check/{bookId}")
    public ResponseEntity<Map<String, Object>> checkBookInLibrary(@PathVariable Long bookId) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            UserBookResponse userBook = libraryService.getUserBookByBookId(userId, bookId);
            
            Map<String, Object> data = new HashMap<>();
            data.put("hasBook", userBook != null);
            if (userBook != null) {
                data.put("userBook", userBook);
            }
            
            return createSuccessResponse(null, data, HttpStatus.OK);
        });
    }
    
    /**
     * Get recent library activity
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        return executeWithErrorHandling(() -> {
            Long userId = securityUtils.getCurrentUserId();
            List<UserBookResponse> recentActivity = libraryService.getRecentActivity(userId, limit);
            return createSuccessResponse(null, recentActivity, HttpStatus.OK);
        });
    }

    /**
     * Get reviews for a specific book (public)
     */
    @GetMapping("/book/{bookId}/reviews")
    public ResponseEntity<Map<String, Object>> getBookReviews(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return executeWithErrorHandling(() -> {
            Page<UserBookResponse> reviewPage = libraryService.getBookReviews(bookId, page, size);
            PagedResponse<UserBookResponse> response = new PagedResponse<>(reviewPage);
            return createSuccessResponse(null, response, HttpStatus.OK);
        });
    }
    
    /**
     * Get another user's public library
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserPublicLibrary(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return executeWithErrorHandling(() -> {
            Long currentUserId = securityUtils.getCurrentUserId();
            
            // Check if users are friends (for privacy)
            // if (!libraryService.areUsersFriends(currentUserId, userId)) {
            //     return ResponseEntity.status(HttpStatus.FORBIDDEN)
            //             .body(createErrorResponse("You can only view libraries of your friends").getBody());
            // }
            
            Page<UserBookResponse> libraryPage = libraryService.getUserLibrary(userId, page, size, sortBy, sortDir);
            PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
            
            return createSuccessResponse(null, response, HttpStatus.OK);
        });
    }
    

    
    /**
     * Helper method to create success response
     */
    private ResponseEntity<Map<String, Object>> createSuccessResponse(String message, Object data, HttpStatus status) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        if (message != null) {
            result.put("message", message);
        }
        if (data != null) {
            result.put("data", data);
        }
        return ResponseEntity.status(status).body(result);
    }
    
    /**
     * Helper method to create error response
     */
    private ResponseEntity<Map<String, Object>> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return ResponseEntity.badRequest().body(error);
    }
    
    /**
     * Execute operation with consistent error handling
     */
    private ResponseEntity<Map<String, Object>> executeWithErrorHandling(
            java.util.function.Supplier<ResponseEntity<Map<String, Object>>> operation) {
        try {
            return operation.get();
        } catch (RuntimeException e) {
            return createErrorResponse(e.getMessage());
        }
    }
}