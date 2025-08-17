package com.booktracker.dto;

public class UserSearchResponse {
    private Long id;
    private String username;
    private String email;
    private boolean isFriend;
    private boolean hasPendingRequest;

    public UserSearchResponse() {}

    public UserSearchResponse(Long id, String username, String email, boolean isFriend, boolean hasPendingRequest) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.isFriend = isFriend;
        this.hasPendingRequest = hasPendingRequest;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isFriend() {
        return isFriend;
    }

    public void setFriend(boolean friend) {
        isFriend = friend;
    }

    public boolean isHasPendingRequest() {
        return hasPendingRequest;
    }

    public void setHasPendingRequest(boolean hasPendingRequest) {
        this.hasPendingRequest = hasPendingRequest;
    }
}
