package com.booktracker.dto;

public class BooksByCategoryReportData {
    
    private String categoryName;
    private Long bookCount;
    private Double percentage;
    
    // Constructors
    public BooksByCategoryReportData() {}
    
    public BooksByCategoryReportData(String categoryName, Long bookCount) {
        this.categoryName = categoryName;
        this.bookCount = bookCount;
    }
    
    public BooksByCategoryReportData(String categoryName, Long bookCount, Double percentage) {
        this.categoryName = categoryName;
        this.bookCount = bookCount;
        this.percentage = percentage;
    }
    
    // Getters and Setters
    public String getCategoryName() {
        return categoryName;
    }
    
    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
    
    public Long getBookCount() {
        return bookCount;
    }
    
    public void setBookCount(Long bookCount) {
        this.bookCount = bookCount;
    }
    
    public Double getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}