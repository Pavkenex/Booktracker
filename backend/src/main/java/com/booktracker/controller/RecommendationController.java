package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.util.SecurityUtils;
import com.booktracker.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:4200")
public class RecommendationController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private SecurityUtils securityUtils;
    
    /**
     * Send a book recommendation
     */
    @PostMapping
    public ResponseEntity<RecommendationResponse> sendRecommendation(
            @Valid @RequestBody RecommendationRequest request) {
        
        Long senderId = securityUtils.getCurrentUserId();
        
        RecommendationResponse recommendation = recommendationService.sendRecommendation(
                senderId, 
                request.getReceiverId(), 
                request.getBookId(), 
                request.getMessage()
        );
        
        return ResponseEntity.ok(recommendation);
    }
    
    /**
     * Get recommendations sent by user
     */
    @GetMapping("/sent")
    public ResponseEntity<List<RecommendationResponse>> getSentRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = securityUtils.getCurrentUserId();
        
        List<RecommendationResponse> recommendations = recommendationService.getSentRecommendations(userId, page, size);
        
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Get recommendations received by user
     */
    @GetMapping("/received")
    public ResponseEntity<List<RecommendationResponse>> getReceivedRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = securityUtils.getCurrentUserId();
        
        List<RecommendationResponse> recommendations = recommendationService.getReceivedRecommendations(userId, page, size);
        
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Get recommendations between two users
     */
    @GetMapping("/between/{friendId}")
    public ResponseEntity<List<RecommendationResponse>> getRecommendationsBetweenUsers(
            @PathVariable Long friendId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Long userId = securityUtils.getCurrentUserId();
        List<RecommendationResponse> recommendations = recommendationService.getRecommendationsBetweenUsers(userId, friendId, page, size);
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Get recent recommendations for user
     */
    @GetMapping("/recent")
    public ResponseEntity<List<RecommendationResponse>> getRecentRecommendations(
            @RequestParam(defaultValue = "5") int limit) {
        
        Long userId = securityUtils.getCurrentUserId();
        List<RecommendationResponse> recommendations = recommendationService.getRecentRecommendations(userId, limit);
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Get recommendations for a specific book
     */
    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<RecommendationResponse>> getRecommendationsForBook(@PathVariable Long bookId) {
        List<RecommendationResponse> recommendations = recommendationService.getRecommendationsForBook(bookId);
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Mark recommendation as read
     */
    @PutMapping("/{recommendationId}/read")
    public ResponseEntity<Void> markRecommendationAsRead(@PathVariable Long recommendationId) {
        Long userId = securityUtils.getCurrentUserId();
        recommendationService.markRecommendationAsRead(userId, recommendationId);
        return ResponseEntity.ok().build();
    }

    /**
     * Delete a recommendation
     */
    @DeleteMapping("/{recommendationId}")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable Long recommendationId) {
        Long userId = securityUtils.getCurrentUserId();
        recommendationService.deleteRecommendation(userId, recommendationId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Get recommendation statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<RecommendationStatsResponse> getRecommendationStats() {
        Long userId = securityUtils.getCurrentUserId();
        RecommendationService.RecommendationStats stats = recommendationService.getRecommendationStats(userId);
        return ResponseEntity.ok(new RecommendationStatsResponse(stats.getSentCount(), stats.getReceivedCount()));
    }
    
    /**
     * Check if user has recommended a book to another user
     */
    @GetMapping("/check")
    public ResponseEntity<Boolean> checkRecommendation(
            @RequestParam Long receiverId,
            @RequestParam Long bookId) {
        
        Long senderId = securityUtils.getCurrentUserId();
        boolean hasRecommended = recommendationService.hasRecommended(senderId, receiverId, bookId);
        return ResponseEntity.ok(hasRecommended);
    }
    
    /**
     * Get most recommended books
     */
    @GetMapping("/popular")
    public ResponseEntity<List<BookResponse>> getMostRecommendedBooks(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Object[]> mostRecommended = recommendationService.getMostRecommendedBooks(limit);
        // Convert Object[] to BookResponse - assuming Object[] contains [Book, count]
        List<BookResponse> bookResponses = mostRecommended.stream()
            .map(arr -> new BookResponse((com.booktracker.entity.Book) arr[0]))
            .toList();
        return ResponseEntity.ok(bookResponses);
    }
}