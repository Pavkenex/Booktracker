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
    
    
    Optional<Genre> findByName(String name);
    
    
    Optional<Genre> findByNameIgnoreCase(String name);
    
    
    boolean existsByName(String name);
    
    
    boolean existsByNameIgnoreCase(String name);
    
    
    List<Genre> findByNameContainingIgnoreCase(String name);
    
    
    List<Genre> findAllByOrderByNameAsc();
    
    
    @Query("SELECT g.name, COUNT(b) FROM Genre g LEFT JOIN g.books b GROUP BY g.id, g.name ORDER BY g.name")
    List<Object[]> countBooksByGenre();
    
    
    @Query("SELECT DISTINCT g FROM Genre g JOIN g.books b ORDER BY g.name")
    List<Genre> findGenresWithBooks();
    
    
    @Query("SELECT g FROM Genre g JOIN g.books b GROUP BY g ORDER BY COUNT(b) DESC")
    List<Genre> findMostPopularGenres(@Param("limit") org.springframework.data.domain.Pageable pageable);
}
