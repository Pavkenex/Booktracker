package com.booktracker.controller;

import com.booktracker.security.JwtUtil;
import com.booktracker.service.FriendshipService;
import com.booktracker.service.RecommendationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {
    
    @Autowired
    private FriendshipService friendshipService;
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Get notification count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getNotificationCount(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        
        long friendRequests = friendshipService.getPendingRequestCount(userId);
        long recommendations = recommendationService.getUnreadRecommendationCount(userId);
        long total = friendRequests + recommendations;
        
        System.out.println("Notification count for user " + userId + ": friendRequests=" + friendRequests + ", recommendations=" + recommendations + ", total=" + total);
        
        Map<String, Object> response = new HashMap<>();
        response.put("friendRequests", friendRequests);
        response.put("recommendations", recommendations);
        response.put("total", total);
        
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