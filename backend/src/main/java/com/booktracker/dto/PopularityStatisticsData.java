package com.booktracker.dto;

public class PopularityStatisticsData {
    
    private Long bookId;
    private String title;
    private String author;
    private Long viewCount;
    private Double percentage;
    private Integer rank;
    
    public PopularityStatisticsData() {}
    
    public PopularityStatisticsData(Long bookId, String title, String author, Long viewCount) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.viewCount = viewCount;
    }
    
    public PopularityStatisticsData(Long bookId, String title, String author, Long viewCount, Double percentage, Integer rank) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.viewCount = viewCount;
        this.percentage = percentage;
        this.rank = rank;
    }
    
    public Long getBookId() {
        return bookId;
    }
    
    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public Long getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }
    
    public Double getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
    
    public Integer getRank() {
        return rank;
    }
    
    public void setRank(Integer rank) {
        this.rank = rank;
    }
}