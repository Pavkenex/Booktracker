package com.booktracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public class PasswordResetDto {
    
    public enum ResetType {
        REQUEST,    
        CONFIRM     
    }
    
    private ResetType type;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String token;
    
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String newPassword;
    
    public PasswordResetDto() {}
    
    
    public PasswordResetDto(String email) {
        this.type = ResetType.REQUEST;
        this.email = email;
    }
    
    
    public PasswordResetDto(String token, String newPassword) {
        this.type = ResetType.CONFIRM;
        this.token = token;
        this.newPassword = newPassword;
    }
    
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
    
    
    public boolean isRequestType() {
        return ResetType.REQUEST.equals(type);
    }
    
    
    public boolean isConfirmType() {
        return ResetType.CONFIRM.equals(type);
    }
}

