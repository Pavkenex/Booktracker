package com.booktracker.dto;

import java.time.LocalDate;

public class DailyActivityReportData {
    
    private LocalDate date;
    private Long userRegistrations;
    private Long booksAdded;
    private Long reviewsPosted;
    private Long friendRequestsSent;
    private Long recommendationsSent;
    
    public DailyActivityReportData() {}
    
    public DailyActivityReportData(LocalDate date, Long userRegistrations, Long booksAdded, Long reviewsPosted) {
        this.date = date;
        this.userRegistrations = userRegistrations;
        this.booksAdded = booksAdded;
        this.reviewsPosted = reviewsPosted;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public Long getUserRegistrations() {
        return userRegistrations;
    }
    
    public void setUserRegistrations(Long userRegistrations) {
        this.userRegistrations = userRegistrations;
    }
    
    public Long getBooksAdded() {
        return booksAdded;
    }
    
    public void setBooksAdded(Long booksAdded) {
        this.booksAdded = booksAdded;
    }
    
    public Long getReviewsPosted() {
        return reviewsPosted;
    }
    
    public void setReviewsPosted(Long reviewsPosted) {
        this.reviewsPosted = reviewsPosted;
    }
    
    public Long getFriendRequestsSent() {
        return friendRequestsSent;
    }
    
    public void setFriendRequestsSent(Long friendRequestsSent) {
        this.friendRequestsSent = friendRequestsSent;
    }
    
    public Long getRecommendationsSent() {
        return recommendationsSent;
    }
    
    public void setRecommendationsSent(Long recommendationsSent) {
        this.recommendationsSent = recommendationsSent;
    }
}
