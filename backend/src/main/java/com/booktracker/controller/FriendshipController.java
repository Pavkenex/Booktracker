package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.dto.FriendRequestActionDto;
import com.booktracker.entity.User;
import com.booktracker.util.SecurityUtils;
import com.booktracker.service.FriendshipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "http://localhost:4200")
public class FriendshipController {
    
    @Autowired
    private FriendshipService friendshipService;
    
    @Autowired
    private SecurityUtils securityUtils;
    
    /**
     * Get user's friends
     */
    @GetMapping
    public ResponseEntity<List<FriendshipResponse>> getFriends() {
        Long userId = securityUtils.getCurrentUserId();
        
        List<FriendshipResponse> friendships = friendshipService.getFriendships(userId);
        
        return ResponseEntity.ok(friendships);
    }
    
    /**
     * Send friend request
     */
    @PostMapping("/request")
    public ResponseEntity<FriendshipResponse> sendFriendRequest(
            @Valid @RequestBody FriendRequestActionDto request) {
        
        Long userId = securityUtils.getCurrentUserId();
        FriendshipResponse friendship = friendshipService.sendFriendRequest(userId, request.getFriendId());
        return ResponseEntity.ok(friendship);
    }
    
    /**
     * Accept or decline friend request
     */
    @PutMapping("/request/{friendshipId}")
    public ResponseEntity<FriendshipResponse> respondToFriendRequest(
            @PathVariable Long friendshipId,
            @RequestBody FriendRequestActionDto request) {
        
        Long userId = securityUtils.getCurrentUserId();
        
        if (request.isAccept()) {
            FriendshipResponse friendship = friendshipService.acceptFriendRequest(userId, friendshipId);
            return ResponseEntity.ok(friendship);
        } else {
            friendshipService.declineFriendRequest(userId, friendshipId);
            return ResponseEntity.noContent().build();
        }
    }
    
    /**
     * Remove friend (unfriend)
     */
    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long friendId) {
        Long userId = securityUtils.getCurrentUserId();
        friendshipService.removeFriend(userId, friendId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get sent friend requests
     */
    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendshipResponse>> getSentFriendRequests() {
        Long userId = securityUtils.getCurrentUserId();
        List<FriendshipResponse> sentRequests = friendshipService.getSentFriendRequests(userId);
        return ResponseEntity.ok(sentRequests);
    }
    
    /**
     * Get friend requests (received)
     */
    @GetMapping("/requests")
    public ResponseEntity<List<FriendshipResponse>> getFriendRequests() {
        Long userId = securityUtils.getCurrentUserId();
        
        List<FriendshipResponse> receivedRequests = friendshipService.getReceivedFriendRequests(userId);
        
        return ResponseEntity.ok(receivedRequests);
    }

    /**
     * Get received friend requests
     */
    @GetMapping("/requests/received")
    public ResponseEntity<List<FriendshipResponse>> getReceivedFriendRequests() {
        Long userId = securityUtils.getCurrentUserId();
        List<FriendshipResponse> receivedRequests = friendshipService.getReceivedFriendRequests(userId);
        return ResponseEntity.ok(receivedRequests);
    }
    
    /**
     * Check if users are friends
     */
    @GetMapping("/check/{friendId}")
    public ResponseEntity<Boolean> checkFriendship(@PathVariable Long friendId) {
        Long userId = securityUtils.getCurrentUserId();
        boolean areFriends = friendshipService.areFriends(userId, friendId);
        return ResponseEntity.ok(areFriends);
    }
    
    /**
     * Get mutual friends
     */
    @GetMapping("/mutual/{friendId}")
    public ResponseEntity<List<UserDto>> getMutualFriends(@PathVariable Long friendId) {
        Long userId = securityUtils.getCurrentUserId();
        List<User> mutualFriends = friendshipService.getMutualFriends(userId, friendId);
        List<UserDto> userResponses = mutualFriends.stream()
            .map(UserDto::new)
            .toList();
        return ResponseEntity.ok(userResponses);
    }
    
    /**
     * Search users for friend requests
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(@RequestParam("q") String query) {
        Long userId = securityUtils.getCurrentUserId();
        List<User> users = friendshipService.searchUsers(query, userId);
        List<UserSearchResponse> searchResults = users.stream().map(user -> 
            new UserSearchResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                friendshipService.areFriends(userId, user.getId()),
                friendshipService.hasPendingRequest(userId, user.getId())
            )
        ).toList();
        return ResponseEntity.ok(searchResults);
    }
}
