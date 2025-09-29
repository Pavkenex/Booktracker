package com.booktracker.dto;

public class UserEngagementReportData {
    
    private String username;
    private String email;
    private Long totalBooks;
    private Long booksRead;
    private Long booksToRead;
    private Long friendsCount;
    private Long recommendationsSent;
    private Long recommendationsReceived;
    private Double averageRating;
    private Long reviewsWritten;
    
    public UserEngagementReportData() {}
    
    public UserEngagementReportData(String username, String email, Long totalBooks, Long booksRead) {
        this.username = username;
        this.email = email;
        this.totalBooks = totalBooks;
        this.booksRead = booksRead;
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
    
    public Long getTotalBooks() {
        return totalBooks;
    }
    
    public void setTotalBooks(Long totalBooks) {
        this.totalBooks = totalBooks;
    }
    
    public Long getBooksRead() {
        return booksRead;
    }
    
    public void setBooksRead(Long booksRead) {
        this.booksRead = booksRead;
    }
    
    public Long getBooksToRead() {
        return booksToRead;
    }
    
    public void setBooksToRead(Long booksToRead) {
        this.booksToRead = booksToRead;
    }
    
    public Long getFriendsCount() {
        return friendsCount;
    }
    
    public void setFriendsCount(Long friendsCount) {
        this.friendsCount = friendsCount;
    }
    
    public Long getRecommendationsSent() {
        return recommendationsSent;
    }
    
    public void setRecommendationsSent(Long recommendationsSent) {
        this.recommendationsSent = recommendationsSent;
    }
    
    public Long getRecommendationsReceived() {
        return recommendationsReceived;
    }
    
    public void setRecommendationsReceived(Long recommendationsReceived) {
        this.recommendationsReceived = recommendationsReceived;
    }
    
    public Double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }
    
    public Long getReviewsWritten() {
        return reviewsWritten;
    }
    
    /**
     * Additional properties used when surfacing summary metrics in the UI.
     */
    private String metric;
    private Number value;
    
    public String getMetric() {
        return metric;
    }
    
    public void setMetric(String metric) {
        this.metric = metric;
    }
    
    public Number getValue() {
        return value;
    }
    
    public void setValue(Number value) {
        this.value = value;
    }
    
    public void setReviewsWritten(Long reviewsWritten) {
        this.reviewsWritten = reviewsWritten;
    }
}