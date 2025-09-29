package com.booktracker.service;

import com.booktracker.dto.GenreRequestDto;
import com.booktracker.dto.GenreResponse;
import com.booktracker.entity.Genre;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.GenreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class GenreService {

    private final GenreRepository genreRepository;

    public GenreService(GenreRepository genreRepository) {
        this.genreRepository = genreRepository;
    }

    /**
     * Get all genres
     */
    @Transactional(readOnly = true)
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAllByOrderByNameAsc().stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get genres with books only
     */
    @Transactional(readOnly = true)
    public List<GenreResponse> getGenresWithBooks() {
        return genreRepository.findGenresWithBooks().stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get genre by ID
     */
    @Transactional(readOnly = true)
    public Optional<GenreResponse> getGenreById(Long id) {
        return genreRepository.findById(id)
                .map(GenreResponse::new);
    }

    /**
     * Get genre by name
     */
    @Transactional(readOnly = true)
    public Optional<GenreResponse> getGenreByName(String name) {
        return genreRepository.findByNameIgnoreCase(name)
                .map(GenreResponse::new);
    }

    /**
     * Search genres by name
     */
    @Transactional(readOnly = true)
    public List<GenreResponse> searchGenres(String name) {
        return genreRepository.findByNameContainingIgnoreCase(name).stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Create a new genre
     */
    public GenreResponse createGenre(GenreRequestDto genreRequest) {
        if (genreRepository.existsByNameIgnoreCase(genreRequest.getName())) {
            throw new IllegalArgumentException("Genre with name '" + genreRequest.getName() + "' already exists");
        }

        Genre genre = new Genre();
        genre.setName(genreRequest.getName());

        Genre savedGenre = genreRepository.save(genre);
        return new GenreResponse(savedGenre);
    }

    /**
     * Update an existing genre
     */
    public Optional<GenreResponse> updateGenre(Long id, GenreRequestDto genreRequest) {
        return genreRepository.findById(id)
                .map(genre -> {
                    Optional<Genre> existingGenre = genreRepository.findByNameIgnoreCase(genreRequest.getName());
                    if (existingGenre.isPresent() && !existingGenre.get().getId().equals(id)) {
                        throw new IllegalArgumentException("Genre with name '" + genreRequest.getName() + "' already exists");
                    }

                    genre.setName(genreRequest.getName());
                    Genre savedGenre = genreRepository.save(genre);
                    return new GenreResponse(savedGenre);
                });
    }

    /**
     * Delete a genre
     */
    public boolean deleteGenre(Long id) {
        Optional<Genre> genre = genreRepository.findById(id);
        if (genre.isPresent()) {
            if (!genre.get().getBooks().isEmpty()) {
                throw new IllegalStateException("Cannot delete genre that has books associated with it. Please reassign books to other genres first.");
            }
            genreRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get book count by genre
     */
    @Transactional(readOnly = true)
    public List<Object[]> getBookCountByGenre() {
        return genreRepository.countBooksByGenre();
    }

    /**
     * Get most popular genres
     */
    @Transactional(readOnly = true)
    public List<GenreResponse> getMostPopularGenres(int limit) {
        return genreRepository.findMostPopularGenres(
                org.springframework.data.domain.PageRequest.of(0, limit)
        ).stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Check if genre exists by name
     */
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return genreRepository.existsByNameIgnoreCase(name);
    }

    /**
     * Create a new genre (admin version)
     */
    public GenreResponse createGenreForAdmin(GenreRequestDto request) {
        if (genreRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Genre with name '" + request.getName() + "' already exists");
        }
        
        Genre genre = new Genre();
        genre.setName(request.getName());
        
        Genre savedGenre = genreRepository.save(genre);
        return new GenreResponse(savedGenre);
    }

    /**
     * Update an existing genre (admin version)
     */
    public GenreResponse updateGenreForAdmin(Long genreId, GenreRequestDto request) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        
        Optional<Genre> existingGenre = genreRepository.findByNameIgnoreCase(request.getName());
        if (existingGenre.isPresent() && !existingGenre.get().getId().equals(genreId)) {
            throw new IllegalArgumentException("Genre with name '" + request.getName() + "' already exists");
        }
        
        genre.setName(request.getName());
        Genre savedGenre = genreRepository.save(genre);
        return new GenreResponse(savedGenre);
    }

    /**
     * Delete a genre (admin version)
     */
    public void deleteGenreForAdmin(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        
        if (!genre.getBooks().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete genre that has books assigned to it. Please reassign books to other genres first.");
        }
        
        genreRepository.delete(genre);
    }

    /**
     * Get genre by ID (admin version)
     */
    public GenreResponse getGenreByIdForAdmin(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        return new GenreResponse(genre);
    }
}