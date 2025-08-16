package com.booktracker.dto;

import com.booktracker.entity.UserBook;

import java.time.LocalDate;

public class UserBookResponse {
    
    private Long id;
    private BookResponse book;
    private UserBook.ReadingStatus status;
    private Integer rating;
    private String review;
    private LocalDate readDate;
    private Boolean isFavourite;
    private String username; // reviewer username
    
    // Constructors
    public UserBookResponse() {}
    
    public UserBookResponse(UserBook userBook) {
        this.id = userBook.getId();
        this.book = new BookResponse(userBook.getBook());
        this.status = userBook.getStatus();
        this.rating = userBook.getRating();
        this.review = userBook.getReview();
        this.readDate = userBook.getReadDate();
        this.isFavourite = userBook.getIsFavourite();
    this.username = userBook.getUser() != null ? userBook.getUser().getUsername() : null;
    }
    
    // Constructor with pre-calculated book rating to avoid circular loading
    public UserBookResponse(UserBook userBook, Double bookRating) {
        this.id = userBook.getId();
        this.book = new BookResponse(userBook.getBook(), bookRating);
        this.status = userBook.getStatus();
        this.rating = userBook.getRating();
        this.review = userBook.getReview();
        this.readDate = userBook.getReadDate();
        this.isFavourite = userBook.getIsFavourite();
    this.username = userBook.getUser() != null ? userBook.getUser().getUsername() : null;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public BookResponse getBook() {
        return book;
    }
    
    public void setBook(BookResponse book) {
        this.book = book;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}