package com.booktracker.repository;

import com.booktracker.entity.Book;
import com.booktracker.entity.Recommendation;
import com.booktracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    
    /**
     * Find recommendations sent by user
     */
    List<Recommendation> findBySender(User sender);
    
    /**
     * Find recommendations sent by user with pagination
     */
    Page<Recommendation> findBySender(User sender, Pageable pageable);
    
    /**
     * Find recommendations received by user
     */
    List<Recommendation> findByReceiver(User receiver);
    
    /**
     * Find recommendations received by user with pagination
     */
    Page<Recommendation> findByReceiver(User receiver, Pageable pageable);
    
    /**
     * Find recommendations for a specific book
     */
    List<Recommendation> findByBook(Book book);
    
    /**
     * Find recommendations between two users
     */
    List<Recommendation> findBySenderAndReceiver(User sender, User receiver);
    
    /**
     * Find recommendations between two users with pagination
     */
    Page<Recommendation> findBySenderAndReceiver(User sender, User receiver, Pageable pageable);
    
    /**
     * Find recommendations for a specific book from a user
     */
    List<Recommendation> findBySenderAndBook(User sender, Book book);
    
    /**
     * Find recommendations for a specific book to a user
     */
    List<Recommendation> findByReceiverAndBook(User receiver, Book book);
    
    /**
     * Check if user has already recommended a book to another user
     */
    boolean existsBySenderAndReceiverAndBook(User sender, User receiver, Book book);
    
    /**
     * Find recent recommendations for user
     */
    @Query("SELECT r FROM Recommendation r WHERE r.receiver = :user ORDER BY r.createdAt DESC")
    List<Recommendation> findRecentRecommendationsForUser(@Param("user") User user, Pageable pageable);
    
    /**
     * Find recommendations created between dates
     */
    @Query("SELECT r FROM Recommendation r WHERE r.createdAt BETWEEN :startDate AND :endDate")
    List<Recommendation> findRecommendationsBetweenDates(@Param("startDate") LocalDateTime startDate,
                                                        @Param("endDate") LocalDateTime endDate);
    
    /**
     * Count recommendations sent by user
     */
    long countBySender(User sender);
    
    /**
     * Count recommendations received by user
     */
    long countByReceiver(User receiver);
    
    /**
     * Count recommendations for a book
     */
    long countByBook(Book book);
    
    /**
     * Find most recommended books
     */
    @Query("SELECT r.book, COUNT(r) as recommendationCount FROM Recommendation r " +
           "GROUP BY r.book ORDER BY recommendationCount DESC")
    List<Object[]> findMostRecommendedBooks(Pageable pageable);
    
    /**
     * Find users who recommend the most
     */
    @Query("SELECT r.sender, COUNT(r) as recommendationCount FROM Recommendation r " +
           "GROUP BY r.sender ORDER BY recommendationCount DESC")
    List<Object[]> findMostActiveRecommenders(Pageable pageable);
    
    /**
     * Find recommendations created today
     */
    @Query("SELECT COUNT(r) FROM Recommendation r WHERE CAST(r.createdAt AS date) = CURRENT_DATE")
    long countRecommendationsToday();
    
    /**
     * Count recommendations sent on specific date
     */
    @Query("SELECT COUNT(r) FROM Recommendation r WHERE CAST(r.createdAt AS date) = :date")
    long countRecommendationsSentOnDate(@Param("date") java.time.LocalDate date);
    
    /**
     * Find recommendations between friends only
     */
    @Query("SELECT r FROM Recommendation r WHERE EXISTS " +
           "(SELECT f FROM Friendship f WHERE " +
           "((f.user = r.sender AND f.friend = r.receiver) OR " +
           "(f.user = r.receiver AND f.friend = r.sender)) " +
           "AND f.status = 'accepted')")
    List<Recommendation> findRecommendationsBetweenFriends();
    
    /**
     * Delete all recommendations for a book
     */
    void deleteByBook(Book book);
    
    /**
     * Delete all recommendations sent by user
     */
    void deleteBySender(User sender);
    
    /**
     * Delete all recommendations received by user
     */
    void deleteByReceiver(User receiver);
}