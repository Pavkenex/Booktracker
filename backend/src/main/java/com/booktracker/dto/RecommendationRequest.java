package com.booktracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RecommendationRequest {
    
    @NotNull(message = "Receiver ID is required")
    private Long receiverId;
    
    @NotNull(message = "Book ID is required")
    private Long bookId;
    
    @Size(max = 500, message = "Message cannot exceed 500 characters")
    private String message;
    
    public RecommendationRequest() {}
    
    public RecommendationRequest(Long receiverId, Long bookId, String message) {
        this.receiverId = receiverId;
        this.bookId = bookId;
        this.message = message;
    }
    
    // Getters and Setters
    public Long getReceiverId() {
        return receiverId;
    }
    
    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }
    
    public Long getBookId() {
        return bookId;
    }
    
    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}