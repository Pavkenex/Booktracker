package com.booktracker.dto;

import com.booktracker.entity.Recommendation;

import java.time.LocalDateTime;

public class RecommendationResponse {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private Long bookId;
    private UserDto sender;
    private UserDto receiver;
    private BookResponse book;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    
    public RecommendationResponse() {}
    
    public RecommendationResponse(Recommendation recommendation) {
        this.id = recommendation.getId();
        this.senderId = recommendation.getSender().getId();
        this.receiverId = recommendation.getReceiver().getId();
        this.bookId = recommendation.getBook().getId();
        this.sender = new UserDto(recommendation.getSender());
        this.receiver = new UserDto(recommendation.getReceiver());
        this.book = new BookResponse(recommendation.getBook());
        this.message = recommendation.getMessage();
        this.isRead = recommendation.isRead();
        this.createdAt = recommendation.getCreatedAt();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public Long getBookId() {
        return bookId;
    }
    
    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
    
    public Boolean getIsRead() {
        return isRead;
    }
    
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }
}
