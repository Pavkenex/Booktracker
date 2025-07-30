package com.booktracker.controller;

import com.booktracker.dto.RecommendationRequest;
import com.booktracker.dto.RecommendationResponse;
import com.booktracker.security.JwtUtil;
import com.booktracker.service.RecommendationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:4200")
public class RecommendationController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Send a book recommendation
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> sendRecommendation(
            @Valid @RequestBody RecommendationRequest request,
            HttpServletRequest httpRequest) {
        
        Long senderId = getUserIdFromToken(httpRequest);
        
        RecommendationResponse recommendation = recommendationService.sendRecommendation(
                senderId, 
                request.getReceiverId(), 
                request.getBookId(), 
                request.getMessage()
        );
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Recommendation sent successfully");
        response.put("recommendation", recommendation);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recommendations sent by user
     */
    @GetMapping("/sent")
    public ResponseEntity<List<RecommendationResponse>> getSentRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        List<RecommendationResponse> recommendations = recommendationService.getSentRecommendations(userId, page, size);
        
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Get recommendations received by user
     */
    @GetMapping("/received")
    public ResponseEntity<List<RecommendationResponse>> getReceivedRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        List<RecommendationResponse> recommendations = recommendationService.getReceivedRecommendations(userId, page, size);
        
        return ResponseEntity.ok(recommendations);
    }
    
    /**
     * Get recommendations between two users
     */
    @GetMapping("/between/{friendId}")
    public ResponseEntity<Map<String, Object>> getRecommendationsBetweenUsers(
            @PathVariable Long friendId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        List<RecommendationResponse> recommendations = recommendationService.getRecommendationsBetweenUsers(userId, friendId, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("recommendations", recommendations);
        response.put("page", page);
        response.put("size", size);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recent recommendations for user
     */
    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentRecommendations(
            @RequestParam(defaultValue = "5") int limit,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        List<RecommendationResponse> recommendations = recommendationService.getRecentRecommendations(userId, limit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("recommendations", recommendations);
        response.put("limit", limit);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recommendations for a specific book
     */
    @GetMapping("/book/{bookId}")
    public ResponseEntity<Map<String, Object>> getRecommendationsForBook(@PathVariable Long bookId) {
        List<RecommendationResponse> recommendations = recommendationService.getRecommendationsForBook(bookId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("recommendations", recommendations);
        response.put("count", recommendations.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Mark recommendation as read
     */
    @PutMapping("/{recommendationId}/read")
    public ResponseEntity<Map<String, Object>> markRecommendationAsRead(
            @PathVariable Long recommendationId,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        recommendationService.markRecommendationAsRead(userId, recommendationId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Recommendation marked as read");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a recommendation
     */
    @DeleteMapping("/{recommendationId}")
    public ResponseEntity<Map<String, Object>> deleteRecommendation(
            @PathVariable Long recommendationId,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        recommendationService.deleteRecommendation(userId, recommendationId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Recommendation deleted successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get recommendation statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getRecommendationStats(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        
        RecommendationService.RecommendationStats stats = recommendationService.getRecommendationStats(userId);
        
        Map<String, Object> statsMap = new HashMap<>();
        statsMap.put("sentCount", stats.getSentCount());
        statsMap.put("receivedCount", stats.getReceivedCount());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", statsMap);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check if user has recommended a book to another user
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkRecommendation(
            @RequestParam Long receiverId,
            @RequestParam Long bookId,
            HttpServletRequest request) {
        
        Long senderId = getUserIdFromToken(request);
        
        boolean hasRecommended = recommendationService.hasRecommended(senderId, receiverId, bookId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("hasRecommended", hasRecommended);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get most recommended books
     */
    @GetMapping("/popular")
    public ResponseEntity<Map<String, Object>> getMostRecommendedBooks(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<Object[]> mostRecommended = recommendationService.getMostRecommendedBooks(limit);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mostRecommended", mostRecommended);
        response.put("limit", limit);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Extract user ID from JWT token
     */
    private Long getUserIdFromToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String username = jwtUtil.extractUsername(token);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Invalid token");
    }
}