package com.booktracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for genre creation and updates.
 * Used for both regular users and admin operations.
 */
public class GenreRequestDto {
    @NotBlank(message = "Genre name is required")
    @Size(max = 100, message = "Genre name must not exceed 100 characters")
    private String name;

    // Constructors
    public GenreRequestDto() {}

    public GenreRequestDto(String name) {
        this.name = name;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
