package com.booktracker.repository;

import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    /**
     * Find books by title containing (case insensitive)
     */
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    /**
     * Find books by author containing (case insensitive)
     */
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);
    
    /**
     * Find books by title or author containing (case insensitive)
     */
    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "OR LOWER(b.author) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Book> findByTitleOrAuthorContainingIgnoreCase(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Find books by genre
     */
    @Query("SELECT b FROM Book b JOIN b.genres g WHERE g = :genre")
    Page<Book> findByGenre(@Param("genre") Genre genre, Pageable pageable);
    
    /**
     * Find books by genre id
     */
    @Query("SELECT b FROM Book b JOIN b.genres g WHERE g.id = :genreId")
    Page<Book> findByGenreId(@Param("genreId") Long genreId, Pageable pageable);
    
    /**
     * Find books by multiple genres
     */
    @Query("SELECT DISTINCT b FROM Book b JOIN b.genres g WHERE g IN :genres")
    Page<Book> findByGenresIn(@Param("genres") List<Genre> genres, Pageable pageable);

       /**
        * Find similar books by genre ids excluding the original book
        */
       @Query("SELECT DISTINCT b FROM Book b JOIN b.genres g WHERE g.id IN :genreIds AND b.id <> :bookId")
       List<Book> findSimilarBooks(@Param("genreIds") List<Long> genreIds, @Param("bookId") Long bookId, Pageable pageable);
    
    /**
     * Find books by published year
     */
    Page<Book> findByPublishedYear(Integer publishedYear, Pageable pageable);
    
    /**
     * Find books published between years
     */
    Page<Book> findByPublishedYearBetween(Integer startYear, Integer endYear, Pageable pageable);
    
    /**
     * Search books with filters
     */
    @Query("SELECT DISTINCT b FROM Book b LEFT JOIN b.genres g WHERE " +
           "(:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
           "(:genreId IS NULL OR g.id = :genreId) AND " +
           "(:publishedYear IS NULL OR b.publishedYear = :publishedYear)")
    Page<Book> findBooksWithFilters(@Param("title") String title,
                                   @Param("author") String author,
                                   @Param("genreId") Long genreId,
                                   @Param("publishedYear") Integer publishedYear,
                                   Pageable pageable);
    
    /**
     * Count total number of books
     */
    @Query("SELECT COUNT(b) FROM Book b")
    long countTotalBooks();
    
    /**
     * Find most popular books (by number of users who have them)
     */
    @Query("SELECT b FROM Book b JOIN b.userBooks ub GROUP BY b ORDER BY COUNT(ub) DESC")
    List<Book> findMostPopularBooks(Pageable pageable);
    
    /**
     * Find recently added books
     */
    @Query("SELECT b FROM Book b ORDER BY b.id DESC")
    List<Book> findRecentlyAddedBooks(Pageable pageable);
    
    /**
     * Count books created today
     */
    @Query("SELECT COUNT(b) FROM Book b WHERE CAST(b.createdAt AS date) = CURRENT_DATE")
    long countBooksCreatedToday();
    
    /**
     * Count books created on specific date
     */
    @Query("SELECT COUNT(b) FROM Book b WHERE b.createdAt = :date")
    long countBooksCreatedOnDate(@Param("date") java.time.LocalDate date);
}