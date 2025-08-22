package com.booktracker.dto;

import com.booktracker.entity.User;

import java.time.LocalDateTime;

/**
 * DTO representing user information.
 * Used for both profiles and user listings.
 */
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private Boolean isAdmin;

    // Constructors
    public UserDto() {}

    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.createdAt = user.getCreatedAt();
        this.isAdmin = user.getIsAdmin();
    }

    public UserDto(Long id, String username, String email, LocalDateTime createdAt, Boolean isAdmin) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.createdAt = createdAt;
        this.isAdmin = isAdmin;
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
}
