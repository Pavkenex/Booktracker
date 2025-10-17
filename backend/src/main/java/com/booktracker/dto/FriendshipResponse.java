package com.booktracker.dto;

import com.booktracker.entity.Friendship;
import java.time.LocalDateTime;

public class FriendshipResponse {
    private Long id;
    private Long userId;
    private Long friendId;
    private UserDto user;
    private UserDto friend;
    private UserDto sender;
    private UserDto receiver;
    private String status;
    private LocalDateTime createdAt;
    
    public FriendshipResponse() {}
    
    public FriendshipResponse(Friendship friendship) {
        this.id = friendship.getId();
        this.userId = friendship.getUser().getId();
        this.friendId = friendship.getFriend().getId();
        this.user = new UserDto(friendship.getUser());
        this.friend = new UserDto(friendship.getFriend());
        this.sender = new UserDto(friendship.getUser());
        this.receiver = new UserDto(friendship.getFriend());
        this.status = friendship.getStatus().name();
        this.createdAt = friendship.getCreatedAt();
    }
    
    
    public FriendshipResponse(Friendship friendship, Long currentUserId) {
        this.id = friendship.getId();
        this.sender = new UserDto(friendship.getUser());
        this.receiver = new UserDto(friendship.getFriend());
        this.status = friendship.getStatus().name();
        this.createdAt = friendship.getCreatedAt();
        
       
        if (friendship.getUser().getId().equals(currentUserId)) {
            this.user = new UserDto(friendship.getUser());
            this.friend = new UserDto(friendship.getFriend());
            this.userId = friendship.getUser().getId();
            this.friendId = friendship.getFriend().getId();
        } else {
            this.user = new UserDto(friendship.getFriend());
            this.friend = new UserDto(friendship.getUser());
            this.userId = friendship.getFriend().getId();
            this.friendId = friendship.getUser().getId();
        }
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public UserDto getUser() {
        return user;
    }
    
    public void setUser(UserDto user) {
        this.user = user;
    }
    
    public UserDto getFriend() {
        return friend;
    }
    
    public void setFriend(UserDto friend) {
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
    
    public UserDto getSender() {
        return sender;
    }
    
    public void setSender(UserDto sender) {
        this.sender = sender;
    }
    
    public UserDto getReceiver() {
        return receiver;
    }
    
    public void setReceiver(UserDto receiver) {
        this.receiver = receiver;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
