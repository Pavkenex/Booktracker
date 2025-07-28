package com.booktracker.dto;

import com.booktracker.entity.Genre;

public class GenreResponse {
    private Long id;
    private String name;

    // Constructors
    public GenreResponse() {}

    public GenreResponse(Genre genre) {
        this.id = genre.getId();
        this.name = genre.getName();
    }

    public GenreResponse(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}