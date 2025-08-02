package com.booktracker.dto;

import com.booktracker.entity.Friendship;
import java.time.LocalDateTime;

public class FriendshipResponse {
    private Long id;
    private Long userId;
    private Long friendId;
    private UserResponse user;
    private UserResponse friend;
    private UserResponse sender;
    private UserResponse receiver;
    private String status;
    private LocalDateTime createdAt;
    
    public FriendshipResponse() {}
    
    public FriendshipResponse(Friendship friendship) {
        this.id = friendship.getId();
        this.userId = friendship.getUser().getId();
        this.friendId = friendship.getFriend().getId();
        this.user = new UserResponse(friendship.getUser());
        this.friend = new UserResponse(friendship.getFriend());
        this.sender = new UserResponse(friendship.getUser()); // sender is the user who initiated
        this.receiver = new UserResponse(friendship.getFriend()); // receiver is the friend
        this.status = friendship.getStatus().name();
        this.createdAt = friendship.getCreatedAt();
    }
    
    // Constructor that takes the current user's perspective into account
    public FriendshipResponse(Friendship friendship, Long currentUserId) {
        this.id = friendship.getId();
        this.sender = new UserResponse(friendship.getUser()); // sender is always the user who initiated
        this.receiver = new UserResponse(friendship.getFriend()); // receiver is always the friend who received
        this.status = friendship.getStatus().name();
        this.createdAt = friendship.getCreatedAt();
        
        // Set user and friend based on current user's perspective
        if (friendship.getUser().getId().equals(currentUserId)) {
            // Current user is the one who sent the request
            this.user = new UserResponse(friendship.getUser());
            this.friend = new UserResponse(friendship.getFriend());
            this.userId = friendship.getUser().getId();
            this.friendId = friendship.getFriend().getId();
        } else {
            // Current user is the one who received the request
            this.user = new UserResponse(friendship.getFriend());
            this.friend = new UserResponse(friendship.getUser());
            this.userId = friendship.getFriend().getId();
            this.friendId = friendship.getUser().getId();
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public UserResponse getUser() {
        return user;
    }
    
    public void setUser(UserResponse user) {
        this.user = user;
    }
    
    public UserResponse getFriend() {
        return friend;
    }
    
    public void setFriend(UserResponse friend) {
        this.friend = friend;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getFriendId() {
        return friendId;
    }
    
    public void setFriendId(Long friendId) {
        this.friendId = friendId;
    }
    
    public UserResponse getSender() {
        return sender;
    }
    
    public void setSender(UserResponse sender) {
        this.sender = sender;
    }
    
    public UserResponse getReceiver() {
        return receiver;
    }
    
    public void setReceiver(UserResponse receiver) {
        this.receiver = receiver;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}