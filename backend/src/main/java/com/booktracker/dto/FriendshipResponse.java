package com.booktracker.dto;

import com.booktracker.entity.Friendship;

public class FriendshipResponse {
    private Long id;
    private UserResponse user;
    private UserResponse friend;
    private String status;
    
    public FriendshipResponse() {}
    
    public FriendshipResponse(Friendship friendship) {
        this.id = friendship.getId();
        this.user = new UserResponse(friendship.getUser());
        this.friend = new UserResponse(friendship.getFriend());
        this.status = friendship.getStatus().name();
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
}