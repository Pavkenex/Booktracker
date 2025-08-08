package com.booktracker.repository;

import com.booktracker.entity.BookView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookViewRepository extends JpaRepository<BookView, Long> {
    
    /**
     * Find BookView by book ID
     * @param bookId the ID of the book
     * @return Optional containing the BookView if found
     */
    @Query("SELECT bv FROM BookView bv WHERE bv.book.id = :bookId")
    Optional<BookView> findByBookId(@Param("bookId") Long bookId);
    
    /**
     * Find top 10 most popular books ordered by view count descending
     * @return List of BookView entities ordered by view count (highest first)
     */
    List<BookView> findTop10ByOrderByViewCountDesc();
    
    /**
     * Find all BookView entries ordered by view count descending
     * @return List of all BookView entities ordered by view count (highest first)
     */
    List<BookView> findAllByOrderByViewCountDesc();
    
    /**
     * Find BookView entries with view count greater than specified value
     * @param minViewCount minimum view count threshold
     * @return List of BookView entities with view count >= minViewCount
     */
    List<BookView> findByViewCountGreaterThanEqualOrderByViewCountDesc(Long minViewCount);
    
    /**
     * Count total number of book views across all books
     * @return total sum of all view counts
     */
    @Query("SELECT COALESCE(SUM(bv.viewCount), 0) FROM BookView bv")
    Long getTotalViewCount();
    
    /**
     * Check if a book has any views recorded
     * @param bookId the ID of the book
     * @return true if the book has view data, false otherwise
     */
    boolean existsByBookId(Long bookId);
}