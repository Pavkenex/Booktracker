package com.booktracker.controller;

import com.booktracker.dto.GenreRequest;
import com.booktracker.dto.GenreResponse;
import com.booktracker.service.GenreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/genres")
@CrossOrigin(origins = "*")
public class GenreController {

    @Autowired
    private GenreService genreService;

    /**
     * Get all genres
     */
    @GetMapping
    public ResponseEntity<List<GenreResponse>> getAllGenres() {
        List<GenreResponse> genres = genreService.getAllGenres();
        return ResponseEntity.ok(genres);
    }

    /**
     * Get genres that have books
     */
    @GetMapping("/with-books")
    public ResponseEntity<List<GenreResponse>> getGenresWithBooks() {
        List<GenreResponse> genres = genreService.getGenresWithBooks();
        return ResponseEntity.ok(genres);
    }

    /**
     * Get genre by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<GenreResponse> getGenreById(@PathVariable Long id) {
        Optional<GenreResponse> genre = genreService.getGenreById(id);
        return genre.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Search genres by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<GenreResponse>> searchGenres(@RequestParam String name) {
        List<GenreResponse> genres = genreService.searchGenres(name);
        return ResponseEntity.ok(genres);
    }

    /**
     * Get most popular genres
     */
    @GetMapping("/popular")
    public ResponseEntity<List<GenreResponse>> getMostPopularGenres(
            @RequestParam(defaultValue = "10") int limit) {
        
        List<GenreResponse> genres = genreService.getMostPopularGenres(limit);
        return ResponseEntity.ok(genres);
    }

    /**
     * Get book count by genre
     */
    @GetMapping("/stats")
    public ResponseEntity<List<Object[]>> getBookCountByGenre() {
        List<Object[]> stats = genreService.getBookCountByGenre();
        return ResponseEntity.ok(stats);
    }

    /**
     * Create a new genre (Admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GenreResponse> createGenre(@Valid @RequestBody GenreRequest genreRequest) {
        try {
            GenreResponse createdGenre = genreService.createGenre(genreRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdGenre);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing genre (Admin only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GenreResponse> updateGenre(
            @PathVariable Long id,
            @Valid @RequestBody GenreRequest genreRequest) {
        
        try {
            Optional<GenreResponse> updatedGenre = genreService.updateGenre(id, genreRequest);
            return updatedGenre.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a genre (Admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        try {
            boolean deleted = genreService.deleteGenre(id);
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Check if genre exists by name
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> existsByName(@RequestParam String name) {
        boolean exists = genreService.existsByName(name);
        return ResponseEntity.ok(exists);
    }
}