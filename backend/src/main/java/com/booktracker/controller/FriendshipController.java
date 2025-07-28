package com.booktracker.controller;

import com.booktracker.dto.FriendRequestRequest;
import com.booktracker.dto.FriendRequestResponse;
import com.booktracker.dto.FriendshipResponse;
import com.booktracker.entity.User;
import com.booktracker.security.JwtUtil;
import com.booktracker.service.FriendshipService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "http://localhost:4200")
public class FriendshipController {
    
    @Autowired
    private FriendshipService friendshipService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Get user's friends
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getFriends(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        
        List<User> friends = friendshipService.getFriends(userId);
        long friendCount = friendshipService.getFriendCount(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("friends", friends);
        response.put("totalCount", friendCount);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Send friend request
     */
    @PostMapping("/request")
    public ResponseEntity<Map<String, Object>> sendFriendRequest(
            @Valid @RequestBody FriendRequestRequest request,
            HttpServletRequest httpRequest) {
        
        Long userId = getUserIdFromToken(httpRequest);
        
        FriendshipResponse friendship = friendshipService.sendFriendRequest(userId, request.getFriendId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Friend request sent successfully");
        response.put("friendship", friendship);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Accept or decline friend request
     */
    @PutMapping("/request/{friendshipId}")
    public ResponseEntity<Map<String, Object>> respondToFriendRequest(
            @PathVariable Long friendshipId,
            @Valid @RequestBody FriendRequestResponse request,
            HttpServletRequest httpRequest) {
        
        Long userId = getUserIdFromToken(httpRequest);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        
        if ("accept".equalsIgnoreCase(request.getAction())) {
            FriendshipResponse friendship = friendshipService.acceptFriendRequest(userId, friendshipId);
            response.put("message", "Friend request accepted");
            response.put("friendship", friendship);
        } else if ("decline".equalsIgnoreCase(request.getAction())) {
            friendshipService.declineFriendRequest(userId, friendshipId);
            response.put("message", "Friend request declined");
        } else {
            response.put("success", false);
            response.put("error", "Invalid action. Use 'accept' or 'decline'");
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Remove friend (unfriend)
     */
    @DeleteMapping("/{friendId}")
    public ResponseEntity<Map<String, Object>> removeFriend(
            @PathVariable Long friendId,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        friendshipService.removeFriend(userId, friendId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Friend removed successfully");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get sent friend requests
     */
    @GetMapping("/requests/sent")
    public ResponseEntity<Map<String, Object>> getSentFriendRequests(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        
        List<FriendshipResponse> sentRequests = friendshipService.getSentFriendRequests(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("sentRequests", sentRequests);
        response.put("count", sentRequests.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get received friend requests
     */
    @GetMapping("/requests/received")
    public ResponseEntity<Map<String, Object>> getReceivedFriendRequests(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        
        List<FriendshipResponse> receivedRequests = friendshipService.getReceivedFriendRequests(userId);
        long pendingCount = friendshipService.getPendingRequestCount(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("receivedRequests", receivedRequests);
        response.put("pendingCount", pendingCount);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check if users are friends
     */
    @GetMapping("/check/{friendId}")
    public ResponseEntity<Map<String, Object>> checkFriendship(
            @PathVariable Long friendId,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        boolean areFriends = friendshipService.areFriends(userId, friendId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("areFriends", areFriends);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get mutual friends
     */
    @GetMapping("/mutual/{friendId}")
    public ResponseEntity<Map<String, Object>> getMutualFriends(
            @PathVariable Long friendId,
            HttpServletRequest request) {
        
        Long userId = getUserIdFromToken(request);
        
        List<User> mutualFriends = friendshipService.getMutualFriends(userId, friendId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("mutualFriends", mutualFriends);
        response.put("count", mutualFriends.size());
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get friendship statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getFriendshipStats(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        
        long friendCount = friendshipService.getFriendCount(userId);
        long pendingCount = friendshipService.getPendingRequestCount(userId);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("friendCount", friendCount);
        stats.put("pendingRequestCount", pendingCount);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("stats", stats);
        
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