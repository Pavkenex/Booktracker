package com.booktracker.dto;

import com.booktracker.entity.UserBook;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class UserBookRequest {
    
    @NotNull(message = "Book ID is required")
    private Long bookId;
    
    @NotNull(message = "Reading status is required")
    private UserBook.ReadingStatus status;
    
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;
    
    private String review;
    
    private LocalDate readDate;
    
    private Boolean isFavourite = false;
    
    public UserBookRequest() {}
    
    public UserBookRequest(Long bookId, UserBook.ReadingStatus status) {
        this.bookId = bookId;
        this.status = status;
    }
    
    public Long getBookId() {
        return bookId;
    }
    
    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
    
    public UserBook.ReadingStatus getStatus() {
        return status;
    }
    
    public void setStatus(UserBook.ReadingStatus status) {
        this.status = status;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getReview() {
        return review;
    }
    
    public void setReview(String review) {
        this.review = review;
    }
    
    public LocalDate getReadDate() {
        return readDate;
    }
    
    public void setReadDate(LocalDate readDate) {
        this.readDate = readDate;
    }
    
    public Boolean getIsFavourite() {
        return isFavourite;
    }
    
    public void setIsFavourite(Boolean isFavourite) {
        this.isFavourite = isFavourite;
    }
}