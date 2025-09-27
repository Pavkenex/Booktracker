package com.booktracker.dto;

import java.time.LocalDateTime;

public class UserProfileResponse {
    
    private boolean success;
    private String message;
    private UserInfo user;
    
    public static class UserInfo {
        private Long id;
        private String username;
        private String email;
        private LocalDateTime createdAt;
        private Boolean isAdmin;
        private String avatarUrl;
        
        public UserInfo() {}
        
        public UserInfo(Long id, String username, String email, LocalDateTime createdAt, Boolean isAdmin, String avatarUrl) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.createdAt = createdAt;
            this.isAdmin = isAdmin;
            this.avatarUrl = avatarUrl;
        }
        
        // Getters and Setters
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
        
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }
        
        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
        
        public Boolean getIsAdmin() {
            return isAdmin;
        }
        
        public void setIsAdmin(Boolean isAdmin) {
            this.isAdmin = isAdmin;
        }
        
        public String getAvatarUrl() {
            return avatarUrl;
        }
        
        public void setAvatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
        }
    }
    
    // Constructors
    public UserProfileResponse() {}
    
    public UserProfileResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public UserProfileResponse(boolean success, String message, UserInfo user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public UserInfo getUser() {
        return user;
    }
    
    public void setUser(UserInfo user) {
        this.user = user;
    }
    
    // Builder pattern for fluent construction
    public static class Builder {
        private boolean success;
        private String message;
        private UserInfo user;
        
        public Builder success(boolean success) {
            this.success = success;
            return this;
        }
        
        public Builder message(String message) {
            this.message = message;
            return this;
        }
        
        public Builder user(UserInfo user) {
            this.user = user;
            return this;
        }
        
        public Builder avatarUrl(String avatarUrl) {
            if (this.user != null) {
                this.user.setAvatarUrl(avatarUrl);
            }
            return this;
        }
        
        public UserProfileResponse build() {
            return new UserProfileResponse(success, message, user);
        }
    }
    
    public static Builder builder() {
        return new Builder();
    }
}