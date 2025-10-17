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

    
    @Transactional(readOnly = true)
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAllByOrderByNameAsc().stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public List<GenreResponse> getGenresWithBooks() {
        return genreRepository.findGenresWithBooks().stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public Optional<GenreResponse> getGenreById(Long id) {
        return genreRepository.findById(id)
                .map(GenreResponse::new);
    }

    
    @Transactional(readOnly = true)
    public Optional<GenreResponse> getGenreByName(String name) {
        return genreRepository.findByNameIgnoreCase(name)
                .map(GenreResponse::new);
    }

    
    @Transactional(readOnly = true)
    public List<GenreResponse> searchGenres(String name) {
        return genreRepository.findByNameContainingIgnoreCase(name).stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    
    public GenreResponse createGenre(GenreRequestDto genreRequest) {
        if (genreRepository.existsByNameIgnoreCase(genreRequest.getName())) {
            throw new IllegalArgumentException("Genre with name '" + genreRequest.getName() + "' already exists");
        }

        Genre genre = new Genre();
        genre.setName(genreRequest.getName());

        Genre savedGenre = genreRepository.save(genre);
        return new GenreResponse(savedGenre);
    }

    
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

    
    @Transactional(readOnly = true)
    public List<Object[]> getBookCountByGenre() {
        return genreRepository.countBooksByGenre();
    }

    
    @Transactional(readOnly = true)
    public List<GenreResponse> getMostPopularGenres(int limit) {
        return genreRepository.findMostPopularGenres(
                org.springframework.data.domain.PageRequest.of(0, limit)
        ).stream()
                .map(GenreResponse::new)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return genreRepository.existsByNameIgnoreCase(name);
    }

    
    public GenreResponse createGenreForAdmin(GenreRequestDto request) {
        if (genreRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Genre with name '" + request.getName() + "' already exists");
        }
        
        Genre genre = new Genre();
        genre.setName(request.getName());
        
        Genre savedGenre = genreRepository.save(genre);
        return new GenreResponse(savedGenre);
    }

    
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

    
    public void deleteGenreForAdmin(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        
        if (!genre.getBooks().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete genre that has books assigned to it. Please reassign books to other genres first.");
        }
        
        genreRepository.delete(genre);
    }

    
    public GenreResponse getGenreByIdForAdmin(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        return new GenreResponse(genre);
    }
}
