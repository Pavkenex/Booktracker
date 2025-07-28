package com.booktracker.repository;

import com.booktracker.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {
    
    /**
     * Find genre by name
     */
    Optional<Genre> findByName(String name);
    
    /**
     * Find genre by name (case insensitive)
     */
    Optional<Genre> findByNameIgnoreCase(String name);
    
    /**
     * Check if genre name exists
     */
    boolean existsByName(String name);
    
    /**
     * Check if genre name exists (case insensitive)
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Find genres by name containing (case insensitive)
     */
    List<Genre> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find all genres ordered by name
     */
    List<Genre> findAllByOrderByNameAsc();
    
    /**
     * Count books in each genre
     */
    @Query("SELECT g.name, COUNT(b) FROM Genre g LEFT JOIN g.books b GROUP BY g.id, g.name ORDER BY g.name")
    List<Object[]> countBooksByGenre();
    
    /**
     * Find genres with at least one book
     */
    @Query("SELECT DISTINCT g FROM Genre g JOIN g.books b ORDER BY g.name")
    List<Genre> findGenresWithBooks();
    
    /**
     * Find most popular genres (by number of books)
     */
    @Query("SELECT g FROM Genre g JOIN g.books b GROUP BY g ORDER BY COUNT(b) DESC")
    List<Genre> findMostPopularGenres(@Param("limit") org.springframework.data.domain.Pageable pageable);
}