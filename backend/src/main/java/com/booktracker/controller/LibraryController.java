package com.booktracker.controller;

import com.booktracker.dto.LibraryStatsResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.dto.UserBookRequest;
import com.booktracker.dto.UserBookResponse;
import com.booktracker.entity.UserBook;
import com.booktracker.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = "http://localhost:4200")
public class LibraryController {
    
    @Autowired
    private LibraryService libraryService;
    
    /**
     * Add a book to user's library
     */
    @PostMapping("/books")
    public ResponseEntity<Map<String, Object>> addBookToLibrary(@Valid @RequestBody UserBookRequest request) {
        try {
            Long userId = getCurrentUserId();
            UserBookResponse response = libraryService.addBookToLibrary(userId, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Book added to library successfully");
            result.put("data", response);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Update a book in user's library
     */
    @PutMapping("/books/{userBookId}")
    public ResponseEntity<Map<String, Object>> updateBookInLibrary(
            @PathVariable Long userBookId,
            @Valid @RequestBody UserBookRequest request) {
        try {
            Long userId = getCurrentUserId();
            UserBookResponse response = libraryService.updateBookInLibrary(userId, userBookId, request);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Book updated successfully");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Remove a book from user's library
     */
    @DeleteMapping("/books/{userBookId}")
    public ResponseEntity<Map<String, Object>> removeBookFromLibrary(@PathVariable Long userBookId) {
        try {
            Long userId = getCurrentUserId();
            libraryService.removeBookFromLibrary(userId, userBookId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Book removed from library successfully");
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get user's library with pagination
     */
    @GetMapping
    public ResponseEntity<PagedResponse<UserBookResponse>> getUserLibrary(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Long userId = getCurrentUserId();
            Page<UserBookResponse> libraryPage = libraryService.getUserLibrary(userId, page, size, sortBy, sortDir);
            
            PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get user's library by reading status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<PagedResponse<UserBookResponse>> getUserLibraryByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Long userId = getCurrentUserId();
            UserBook.ReadingStatus readingStatus = UserBook.ReadingStatus.valueOf(status.toLowerCase());
            Page<UserBookResponse> libraryPage = libraryService.getUserLibraryByStatus(
                    userId, readingStatus, page, size, sortBy, sortDir);
            
            PagedResponse<UserBookResponse> response = new PagedResponse<>(libraryPage);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get user's favorite books
     */
    @GetMapping("/favorites")
    public ResponseEntity<PagedResponse<UserBookResponse>> getUserFavoriteBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            Long userId = getCurrentUserId();
            Page<UserBookResponse> favoritesPage = libraryService.getUserFavoriteBooks(userId, page, size, sortBy, sortDir);
            
            PagedResponse<UserBookResponse> response = new PagedResponse<>(favoritesPage);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Toggle favorite status of a book
     */
    @PutMapping("/books/{userBookId}/favorite")
    public ResponseEntity<Map<String, Object>> toggleFavorite(@PathVariable Long userBookId) {
        try {
            Long userId = getCurrentUserId();
            UserBookResponse response = libraryService.toggleFavorite(userId, userBookId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Favorite status updated successfully");
            result.put("data", response);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get library statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLibraryStats() {
        try {
            Long userId = getCurrentUserId();
            LibraryStatsResponse stats = libraryService.getLibraryStats(userId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", stats);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get a specific book from user's library
     */
    @GetMapping("/books/{userBookId}")
    public ResponseEntity<Map<String, Object>> getUserBook(@PathVariable Long userBookId) {
        try {
            Long userId = getCurrentUserId();
            UserBookResponse response = libraryService.getUserBook(userId, userBookId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", response);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Check if user has a book in their library
     */
    @GetMapping("/books/check/{bookId}")
    public ResponseEntity<Map<String, Object>> checkBookInLibrary(@PathVariable Long bookId) {
        try {
            Long userId = getCurrentUserId();
            UserBookResponse userBook = libraryService.getUserBookByBookId(userId, bookId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("hasBook", userBook != null);
            if (userBook != null) {
                result.put("userBook", userBook);
            }
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get recent library activity
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentActivity(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Long userId = getCurrentUserId();
            List<UserBookResponse> recentActivity = libraryService.getRecentActivity(userId, limit);
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("data", recentActivity);
            
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get current user ID from security context
     */
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            // Extract username and find user by username
            String username = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            // We need to get the user ID from the database using the username
            // This is a temporary solution - ideally we'd store user ID in JWT claims
            return getUserIdByUsername(username);
        }
        
        throw new RuntimeException("Invalid user authentication");
    }
    
    /**
     * Helper method to get user ID by username
     */
    private Long getUserIdByUsername(String username) {
        // We'll need to inject UserRepository or UserService for this
        // For now, let's assume we can get it through the LibraryService
        try {
            // This is a workaround - we should ideally store user ID in JWT
            return libraryService.getUserIdByUsername(username);
        } catch (Exception e) {
            throw new RuntimeException("User not found");
        }
    }
}