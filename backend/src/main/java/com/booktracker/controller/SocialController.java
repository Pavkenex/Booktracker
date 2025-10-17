package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.dto.FriendRequestActionDto;
import com.booktracker.entity.User;
import com.booktracker.util.SecurityUtils;
import com.booktracker.service.FriendshipService;
import com.booktracker.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "http://localhost:4200")
public class SocialController {

    @Autowired
    private FriendshipService friendshipService;

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<FriendshipResponse>> getFriends() {
        Long userId = securityUtils.getCurrentUserId();

        List<FriendshipResponse> friendships = friendshipService.getFriendships(userId);

        return ResponseEntity.ok(friendships);
    }

    @PostMapping("/request")
    public ResponseEntity<FriendshipResponse> sendFriendRequest(
            @Valid @RequestBody FriendRequestActionDto request) {

        Long userId = securityUtils.getCurrentUserId();
        FriendshipResponse friendship = friendshipService.sendFriendRequest(userId, request.getFriendId());
        return ResponseEntity.ok(friendship);
    }

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

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> removeFriend(@PathVariable Long friendId) {
        Long userId = securityUtils.getCurrentUserId();
        friendshipService.removeFriend(userId, friendId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/requests/sent")
    public ResponseEntity<List<FriendshipResponse>> getSentFriendRequests() {
        Long userId = securityUtils.getCurrentUserId();
        List<FriendshipResponse> sentRequests = friendshipService.getSentFriendRequests(userId);
        return ResponseEntity.ok(sentRequests);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendshipResponse>> getFriendRequests() {
        Long userId = securityUtils.getCurrentUserId();

        List<FriendshipResponse> receivedRequests = friendshipService.getReceivedFriendRequests(userId);

        return ResponseEntity.ok(receivedRequests);
    }

    @GetMapping("/check/{friendId}")
    public ResponseEntity<Boolean> checkFriendship(@PathVariable Long friendId) {
        Long userId = securityUtils.getCurrentUserId();
        boolean areFriends = friendshipService.areFriends(userId, friendId);
        return ResponseEntity.ok(areFriends);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResponse>> searchUsers(@RequestParam("q") String query) {
        Long userId = securityUtils.getCurrentUserId();
        List<User> users = friendshipService.searchUsers(query, userId);
        List<UserSearchResponse> searchResults = users.stream().map(user -> new UserSearchResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getAvatarUrl(),
                friendshipService.areFriends(userId, user.getId()),
                friendshipService.hasPendingRequest(userId, user.getId()))).toList();
        return ResponseEntity.ok(searchResults);
    }

    @GetMapping("/notifications/count")
    public ResponseEntity<NotificationCountResponse> getNotificationCount() {
        Long userId = securityUtils.getCurrentUserId();

        long friendRequests = friendshipService.getPendingRequestCount(userId);
        long recommendations = recommendationService.getUnreadRecommendationCount(userId);
        long total = friendRequests + recommendations;

        NotificationCountResponse response = new NotificationCountResponse(friendRequests, recommendations, total);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/notifications/recommendations/mark-all-read")
    public ResponseEntity<Void> markAllRecommendationsAsRead() {
        Long userId = securityUtils.getCurrentUserId();
        recommendationService.markAllRecommendationsAsRead(userId);
        return ResponseEntity.noContent().build();
    }
}
