package com.booktracker.dto;

public class UserSearchResponse {
    private Long id;
    private String username;
    private String email;
    private String avatarUrl;
    private boolean friend;
    private boolean pendingRequest;

    public UserSearchResponse() {
    }

    public UserSearchResponse(Long id, String username, String email, String avatarUrl, boolean friend,
            boolean pendingRequest) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.friend = friend;
        this.pendingRequest = pendingRequest;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public boolean isFriend() {
        return friend;
    }

    public void setFriend(boolean friend) {
        this.friend = friend;
    }

    public boolean hasPendingRequest() {
        return pendingRequest;
    }

    public void setHasPendingRequest(boolean pendingRequest) {
        this.pendingRequest = pendingRequest;
    }

}
