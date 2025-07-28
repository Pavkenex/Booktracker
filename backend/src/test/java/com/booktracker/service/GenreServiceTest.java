package com.booktracker.service;

import com.booktracker.dto.GenreRequest;
import com.booktracker.dto.GenreResponse;
import com.booktracker.entity.Genre;
import com.booktracker.repository.GenreRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GenreServiceTest {

    @Mock
    private GenreRepository genreRepository;

    @InjectMocks
    private GenreService genreService;

    private Genre testGenre;

    @BeforeEach
    void setUp() {
        testGenre = new Genre("Fiction");
        testGenre.setId(1L);
        testGenre.setBooks(new HashSet<>());
    }

    @Test
    void getAllGenres_ShouldReturnAllGenres() {
        // Given
        List<Genre> genres = Arrays.asList(testGenre, new Genre("Non-Fiction"));
        when(genreRepository.findAllByOrderByNameAsc()).thenReturn(genres);

        // When
        List<GenreResponse> result = genreService.getAllGenres();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Fiction", result.get(0).getName());
        verify(genreRepository).findAllByOrderByNameAsc();
    }

    @Test
    void getGenreById_ShouldReturnGenre_WhenExists() {
        // Given
        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));

        // When
        Optional<GenreResponse> result = genreService.getGenreById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals("Fiction", result.get().getName());
        assertEquals(1L, result.get().getId());
        verify(genreRepository).findById(1L);
    }

    @Test
    void getGenreById_ShouldReturnEmpty_WhenNotExists() {
        // Given
        when(genreRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Optional<GenreResponse> result = genreService.getGenreById(1L);

        // Then
        assertFalse(result.isPresent());
        verify(genreRepository).findById(1L);
    }

    @Test
    void createGenre_ShouldCreateAndReturnGenre_WhenNameNotExists() {
        // Given
        GenreRequest request = new GenreRequest("Science Fiction");
        Genre savedGenre = new Genre("Science Fiction");
        savedGenre.setId(2L);

        when(genreRepository.existsByNameIgnoreCase("Science Fiction")).thenReturn(false);
        when(genreRepository.save(any(Genre.class))).thenReturn(savedGenre);

        // When
        GenreResponse result = genreService.createGenre(request);

        // Then
        assertNotNull(result);
        assertEquals("Science Fiction", result.getName());
        assertEquals(2L, result.getId());
        verify(genreRepository).existsByNameIgnoreCase("Science Fiction");
        verify(genreRepository).save(any(Genre.class));
    }

    @Test
    void createGenre_ShouldThrowException_WhenNameExists() {
        // Given
        GenreRequest request = new GenreRequest("Fiction");
        when(genreRepository.existsByNameIgnoreCase("Fiction")).thenReturn(true);

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> genreService.createGenre(request)
        );
        
        assertEquals("Genre with name 'Fiction' already exists", exception.getMessage());
        verify(genreRepository).existsByNameIgnoreCase("Fiction");
        verify(genreRepository, never()).save(any(Genre.class));
    }

    @Test
    void updateGenre_ShouldUpdateAndReturnGenre_WhenExists() {
        // Given
        GenreRequest request = new GenreRequest("Updated Fiction");
        Genre updatedGenre = new Genre("Updated Fiction");
        updatedGenre.setId(1L);

        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));
        when(genreRepository.findByNameIgnoreCase("Updated Fiction")).thenReturn(Optional.empty());
        when(genreRepository.save(any(Genre.class))).thenReturn(updatedGenre);

        // When
        Optional<GenreResponse> result = genreService.updateGenre(1L, request);

        // Then
        assertTrue(result.isPresent());
        assertEquals("Updated Fiction", result.get().getName());
        assertEquals(1L, result.get().getId());
        verify(genreRepository).findById(1L);
        verify(genreRepository).save(any(Genre.class));
    }

    @Test
    void deleteGenre_ShouldReturnTrue_WhenGenreExistsAndHasNoBooks() {
        // Given
        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));

        // When
        boolean result = genreService.deleteGenre(1L);

        // Then
        assertTrue(result);
        verify(genreRepository).findById(1L);
        verify(genreRepository).deleteById(1L);
    }

    @Test
    void deleteGenre_ShouldReturnFalse_WhenGenreNotExists() {
        // Given
        when(genreRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        boolean result = genreService.deleteGenre(1L);

        // Then
        assertFalse(result);
        verify(genreRepository).findById(1L);
        verify(genreRepository, never()).deleteById(1L);
    }

    @Test
    void searchGenres_ShouldReturnMatchingGenres() {
        // Given
        List<Genre> genres = Arrays.asList(testGenre);
        when(genreRepository.findByNameContainingIgnoreCase("Fic")).thenReturn(genres);

        // When
        List<GenreResponse> result = genreService.searchGenres("Fic");

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Fiction", result.get(0).getName());
        verify(genreRepository).findByNameContainingIgnoreCase("Fic");
    }

    @Test
    void existsByName_ShouldReturnTrue_WhenGenreExists() {
        // Given
        when(genreRepository.existsByNameIgnoreCase("Fiction")).thenReturn(true);

        // When
        boolean result = genreService.existsByName("Fiction");

        // Then
        assertTrue(result);
        verify(genreRepository).existsByNameIgnoreCase("Fiction");
    }

    @Test
    void existsByName_ShouldReturnFalse_WhenGenreNotExists() {
        // Given
        when(genreRepository.existsByNameIgnoreCase("NonExistent")).thenReturn(false);

        // When
        boolean result = genreService.existsByName("NonExistent");

        // Then
        assertFalse(result);
        verify(genreRepository).existsByNameIgnoreCase("NonExistent");
    }
}