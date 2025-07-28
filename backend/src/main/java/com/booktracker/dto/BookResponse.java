package com.booktracker.dto;

import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;

import java.util.Set;
import java.util.stream.Collectors;

public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private Integer publishedYear;
    private String thumbnail;
    private String description;
    private Set<GenreResponse> genres;

    // Constructors
    public BookResponse() {}

    public BookResponse(Book book) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.author = book.getAuthor();
        this.publishedYear = book.getPublishedYear();
        this.thumbnail = book.getThumbnail();
        this.description = book.getDescription();
        this.genres = book.getGenres().stream()
                .map(GenreResponse::new)
                .collect(Collectors.toSet());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Set<GenreResponse> getGenres() {
        return genres;
    }

    public void setGenres(Set<GenreResponse> genres) {
        this.genres = genres;
    }
}