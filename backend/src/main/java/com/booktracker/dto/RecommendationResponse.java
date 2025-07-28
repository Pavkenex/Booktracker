package com.booktracker.dto;

import com.booktracker.entity.Recommendation;

import java.time.LocalDateTime;

public class RecommendationResponse {
    private Long id;
    private UserResponse sender;
    private UserResponse receiver;
    private BookResponse book;
    private String message;
    private LocalDateTime createdAt;
    
    public RecommendationResponse() {}
    
    public RecommendationResponse(Recommendation recommendation) {
        this.id = recommendation.getId();
        this.sender = new UserResponse(recommendation.getSender());
        this.receiver = new UserResponse(recommendation.getReceiver());
        this.book = new BookResponse(recommendation.getBook());
        this.message = recommendation.getMessage();
        this.createdAt = recommendation.getCreatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public UserResponse getSender() {
        return sender;
    }
    
    public void setSender(UserResponse sender) {
        this.sender = sender;
    }
    
    public UserResponse getReceiver() {
        return receiver;
    }
    
    public void setReceiver(UserResponse receiver) {
        this.receiver = receiver;
    }
    
    public BookResponse getBook() {
        return book;
    }
    
    public void setBook(BookResponse book) {
        this.book = book;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}