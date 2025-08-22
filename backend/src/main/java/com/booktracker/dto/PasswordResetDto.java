package com.booktracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Consolidated DTO for password reset operations.
 * Handles both initial request (email only) and confirmation (token + new password)
 */
public class PasswordResetDto {
    
    public enum ResetType {
        REQUEST,     // Initial request with email only
        CONFIRM      // Confirmation with token and new password
    }
    
    private ResetType type;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String token;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;
    
    // Constructors
    public PasswordResetDto() {}
    
    // Constructor for request type (email only)
    public PasswordResetDto(String email) {
        this.type = ResetType.REQUEST;
        this.email = email;
    }
    
    // Constructor for confirm type (token + new password)
    public PasswordResetDto(String token, String newPassword) {
        this.type = ResetType.CONFIRM;
        this.token = token;
        this.newPassword = newPassword;
    }
    
    // Getters and Setters
    public ResetType getType() {
        return type;
    }
    
    public void setType(ResetType type) {
        this.type = type;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    // Helper methods
    public boolean isRequestType() {
        return ResetType.REQUEST.equals(type);
    }
    
    public boolean isConfirmType() {
        return ResetType.CONFIRM.equals(type);
    }
}
