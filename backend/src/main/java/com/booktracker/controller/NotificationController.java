package com.booktracker.controller;

import com.booktracker.dto.NotificationCountResponse;
import com.booktracker.util.SecurityUtils;
import com.booktracker.service.FriendshipService;
import com.booktracker.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:4200")
public class NotificationController {
    
    @Autowired
    private FriendshipService friendshipService;
    
    @Autowired
    private RecommendationService recommendationService;
    
    @Autowired
    private SecurityUtils securityUtils;
    
    /**
     * Get notification count
     */
    @GetMapping("/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<NotificationCountResponse> getNotificationCount() {
        Long userId = securityUtils.getCurrentUserId();
        
        long friendRequests = friendshipService.getPendingRequestCount(userId);
        long recommendations = recommendationService.getUnreadRecommendationCount(userId);
        long total = friendRequests + recommendations;
        
        NotificationCountResponse response = new NotificationCountResponse(friendRequests, recommendations, total);
        return ResponseEntity.ok(response);
    }
}