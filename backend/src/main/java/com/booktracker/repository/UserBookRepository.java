package com.booktracker.repository;

import com.booktracker.entity.Book;
import com.booktracker.entity.User;
import com.booktracker.entity.UserBook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {
    
    /**
     * Find user's book entry
     */
    Optional<UserBook> findByUserAndBook(User user, Book book);
    
    /**
     * Find user's book entry by IDs
     */
    Optional<UserBook> findByUserIdAndBookId(Long userId, Long bookId);
    
    /**
     * Find all books for a user
     */
    List<UserBook> findByUser(User user);
    
    /**
     * Find all books for a user with pagination
     */
    Page<UserBook> findByUser(User user, Pageable pageable);
    
    /**
     * Find user's books by status
     */
    List<UserBook> findByUserAndStatus(User user, UserBook.ReadingStatus status);
    
    /**
     * Find user's books by status with pagination
     */
    Page<UserBook> findByUserAndStatus(User user, UserBook.ReadingStatus status, Pageable pageable);
    
    /**
     * Find user's favorite books
     */
    List<UserBook> findByUserAndIsFavouriteTrue(User user);
    
    /**
     * Find user's favorite books with pagination
     */
    Page<UserBook> findByUserAndIsFavouriteTrue(User user, Pageable pageable);
    
    /**
     * Find user's books with rating
     */
    List<UserBook> findByUserAndRatingIsNotNull(User user);
    
    /**
     * Find user's books by rating
     */
    List<UserBook> findByUserAndRating(User user, Integer rating);
    
    /**
     * Check if user has book in library
     */
    boolean existsByUserAndBook(User user, Book book);
    
    /**
     * Check if user has book in library by IDs
     */
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    
    /**
     * Count user's books by status
     */
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.user = :user AND ub.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") UserBook.ReadingStatus status);
    
    /**
     * Count user's total books
     */
    long countByUser(User user);
    
    /**
     * Count user's favorite books
     */
    long countByUserAndIsFavouriteTrue(User user);
    
    /**
     * Find user's books read in date range
     */
    @Query("SELECT ub FROM UserBook ub WHERE ub.user = :user AND ub.status = 'read' " +
           "AND ub.readDate BETWEEN :startDate AND :endDate")
    List<UserBook> findBooksReadBetweenDates(@Param("user") User user,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
    
    /**
     * Find user's recent activity (recently added/updated books)
     */
    @Query("SELECT ub FROM UserBook ub WHERE ub.user = :user ORDER BY ub.id DESC")
    List<UserBook> findRecentActivity(@Param("user") User user, Pageable pageable);
    
    /**
     * Get user's reading statistics
     */
    @Query("SELECT ub.status, COUNT(ub) FROM UserBook ub WHERE ub.user = :user GROUP BY ub.status")
    List<Object[]> getUserReadingStatistics(@Param("user") User user);
    
    /**
     * Get user's rating distribution
     */
    @Query("SELECT ub.rating, COUNT(ub) FROM UserBook ub WHERE ub.user = :user AND ub.rating IS NOT NULL GROUP BY ub.rating ORDER BY ub.rating")
    List<Object[]> getUserRatingDistribution(@Param("user") User user);
    
    /**
     * Find most popular books (by number of users)
     */
    @Query("SELECT ub.book, COUNT(ub) as userCount FROM UserBook ub GROUP BY ub.book ORDER BY userCount DESC")
    List<Object[]> findMostPopularBooks(Pageable pageable);
    
    /**
     * Find books added today
     */
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE CAST(ub.readDate AS date) = CURRENT_DATE")
    long countBooksAddedToday();
    
    /**
     * Count books added on specific date
     */
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE CAST(ub.readDate AS date) = :date")
    long countBooksAddedOnDate(@Param("date") LocalDate date);
    
    /**
     * Count reviews posted today
     */
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.review IS NOT NULL AND CAST(ub.readDate AS date) = CURRENT_DATE")
    long countReviewsPostedToday();
    
    /**
     * Count reviews posted on specific date
     */
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.review IS NOT NULL AND CAST(ub.readDate AS date) = :date")
    long countReviewsPostedOnDate(@Param("date") LocalDate date);
    
    /**
     * Get average rating for a book
     */
    @Query("SELECT AVG(CAST(ub.rating AS double)) FROM UserBook ub WHERE ub.book.id = :bookId AND ub.rating IS NOT NULL")
    Double getAverageRatingForBook(@Param("bookId") Long bookId);
    
    /**
     * Get average ratings for multiple books
     */
    @Query("SELECT ub.book.id, AVG(CAST(ub.rating AS double)) FROM UserBook ub WHERE ub.book.id IN :bookIds AND ub.rating IS NOT NULL GROUP BY ub.book.id")
    List<Object[]> getAverageRatingsForBooks(@Param("bookIds") List<Long> bookIds);

    /**
     * Get recent reviews for a specific book (non-null review, ordered by most recent id)
     */
    @Query("SELECT ub FROM UserBook ub WHERE ub.book.id = :bookId AND ub.review IS NOT NULL ORDER BY ub.id DESC")
    Page<UserBook> findRecentReviewsForBook(@Param("bookId") Long bookId, Pageable pageable);
    
    /**
     * Count reviews written across all user books
     */
    long countByReviewIsNotNull();

    /**
     * Count user books by reading status across all users
     */
    long countByStatus(UserBook.ReadingStatus status);
}