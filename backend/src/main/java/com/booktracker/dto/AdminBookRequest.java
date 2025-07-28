package com.booktracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public class AdminBookRequest {
    
    @NotBlank(message = "Book title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @NotBlank(message = "Author is required")
    @Size(max = 255, message = "Author must not exceed 255 characters")
    private String author;
    
    private Integer publishedYear;
    
    @Size(max = 255, message = "Thumbnail URL must not exceed 255 characters")
    private String thumbnail;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private Set<Long> genreIds;
    
    // Constructors
    public AdminBookRequest() {}
    
    public AdminBookRequest(String title, String author) {
        this.title = title;
        this.author = author;
    }
    
    // Getters and Setters
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
    
    public Integer getPublishedYear() {
        return publishedYear;
    }
    
    public void setPublishedYear(Integer publishedYear) {
        this.publishedYear = publishedYear;
    }
    
    public String getThumbnail() {
        return thumbnail;
    }
    
    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Set<Long> getGenreIds() {
        return genreIds;
    }
    
    public void setGenreIds(Set<Long> genreIds) {
        this.genreIds = genreIds;
    }
}