package com.booktracker.dto;

import com.booktracker.entity.Friendship;
import java.time.LocalDateTime;

public class FriendRequestDto {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private UserDto sender;
    private UserDto receiver;
    private String status;
    private LocalDateTime createdAt;

    public FriendRequestDto() {}
    
    public FriendRequestDto(Friendship friendship) {
        this.id = friendship.getId();
        this.senderId = friendship.getUser().getId();
        this.receiverId = friendship.getFriend().getId();
        this.sender = new UserDto(friendship.getUser());
        this.receiver = new UserDto(friendship.getFriend());
        this.status = friendship.getStatus().name();
        this.createdAt = friendship.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
