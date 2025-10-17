package com.booktracker.dto;

import java.util.Map;

public class LibraryStatsResponse {
    
    private long totalBooks;
    private long booksRead;
    private long booksCurrentlyReading;
    private long booksToRead;
    private long favoriteBooks;
    private Map<Integer, Long> ratingDistribution;
    private double averageRating;
    
    public LibraryStatsResponse() {}
    
    public LibraryStatsResponse(long totalBooks, long booksRead, long booksCurrentlyReading, 
                               long booksToRead, long favoriteBooks, Map<Integer, Long> ratingDistribution, 
                               double averageRating) {
        this.totalBooks = totalBooks;
        this.booksRead = booksRead;
        this.booksCurrentlyReading = booksCurrentlyReading;
        this.booksToRead = booksToRead;
        this.favoriteBooks = favoriteBooks;
        this.ratingDistribution = ratingDistribution;
        this.averageRating = averageRating;
    }
    
    public long getTotalBooks() {
        return totalBooks;
    }
    
    public void setTotalBooks(long totalBooks) {
        this.totalBooks = totalBooks;
    }
    
    public long getBooksRead() {
        return booksRead;
    }
    
    public void setBooksRead(long booksRead) {
        this.booksRead = booksRead;
    }
    
    public long getBooksCurrentlyReading() {
        return booksCurrentlyReading;
    }
    
    public void setBooksCurrentlyReading(long booksCurrentlyReading) {
        this.booksCurrentlyReading = booksCurrentlyReading;
    }
    
    public long getBooksToRead() {
        return booksToRead;
    }
    
    public void setBooksToRead(long booksToRead) {
        this.booksToRead = booksToRead;
    }
    
    public long getFavoriteBooks() {
        return favoriteBooks;
    }
    
    public void setFavoriteBooks(long favoriteBooks) {
        this.favoriteBooks = favoriteBooks;
    }
    
    public Map<Integer, Long> getRatingDistribution() {
        return ratingDistribution;
    }
    
    public void setRatingDistribution(Map<Integer, Long> ratingDistribution) {
        this.ratingDistribution = ratingDistribution;
    }
    
    public double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }
}
