package com.booktracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.util.Set;

/**
 * DTO for book creation and updates.
 * Used for both regular users and admin operations.
 */
public class BookRequestDto {
    @NotBlank(message = "Book title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @NotBlank(message = "Author is required")
    @Size(max = 255, message = "Author must not exceed 255 characters")
    private String author;

    @Min(value = 1000, message = "Published year must be at least 1000")
    @Max(value = 2100, message = "Published year must not exceed 2100")
    private Integer publishedYear;

    @Size(max = 255, message = "Thumbnail URL must not exceed 255 characters")
    private String thumbnail;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    private Set<Long> genreIds;

    public BookRequestDto() {}

    public BookRequestDto(String title, String author) {
        this.title = title;
        this.author = author;
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
