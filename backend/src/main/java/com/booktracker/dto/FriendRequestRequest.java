package com.booktracker.dto;

import jakarta.validation.constraints.NotNull;

public class FriendRequestRequest {
    
    @NotNull(message = "Friend ID is required")
    private Long friendId;
    
    public FriendRequestRequest() {}
    
    public FriendRequestRequest(Long friendId) {
        this.friendId = friendId;
    }
    
    // Getters and Setters
    public Long getFriendId() {
        return friendId;
    }
    
    public void setFriendId(Long friendId) {
        this.friendId = friendId;
    }
}