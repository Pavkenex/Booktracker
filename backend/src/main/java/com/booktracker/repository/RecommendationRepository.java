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

       
       List<Recommendation> findBySender(User sender);

       
       Page<Recommendation> findBySender(User sender, Pageable pageable);

       
       List<Recommendation> findByReceiver(User receiver);

       
       Page<Recommendation> findByReceiver(User receiver, Pageable pageable);

       
       List<Recommendation> findByBook(Book book);

       
       List<Recommendation> findBySenderAndReceiver(User sender, User receiver);

       
       Page<Recommendation> findBySenderAndReceiver(User sender, User receiver, Pageable pageable);

       
       List<Recommendation> findBySenderAndBook(User sender, Book book);

       
       List<Recommendation> findByReceiverAndBook(User receiver, Book book);

       
       boolean existsBySenderAndReceiverAndBook(User sender, User receiver, Book book);

       
       @Query("SELECT r FROM Recommendation r WHERE r.receiver = :user ORDER BY r.createdAt DESC")
       List<Recommendation> findRecentRecommendationsForUser(@Param("user") User user, Pageable pageable);

       
       @Query("SELECT r FROM Recommendation r WHERE r.createdAt BETWEEN :startDate AND :endDate")
       List<Recommendation> findRecommendationsBetweenDates(@Param("startDate") LocalDateTime startDate,
                     @Param("endDate") LocalDateTime endDate);

       
       long countBySender(User sender);

       
       long countByReceiver(User receiver);

       
       long countByBook(Book book);

       
       @Query("SELECT r.book, COUNT(r) as recommendationCount FROM Recommendation r " +
                     "GROUP BY r.book ORDER BY recommendationCount DESC")
       List<Object[]> findMostRecommendedBooks(Pageable pageable);

       
       @Query("SELECT r.sender, COUNT(r) as recommendationCount FROM Recommendation r " +
                     "GROUP BY r.sender ORDER BY recommendationCount DESC")
       List<Object[]> findMostActiveRecommenders(Pageable pageable);

       
       @Query("SELECT COUNT(r) FROM Recommendation r WHERE CAST(r.createdAt AS date) = CURRENT_DATE")
       long countRecommendationsToday();

       
       @Query("SELECT COUNT(r) FROM Recommendation r WHERE CAST(r.createdAt AS date) = :date")
       long countRecommendationsSentOnDate(@Param("date") java.time.LocalDate date);

       
       @Query("SELECT r FROM Recommendation r WHERE EXISTS " +
                     "(SELECT f FROM Friendship f WHERE " +
                     "((f.user = r.sender AND f.friend = r.receiver) OR " +
                     "(f.user = r.receiver AND f.friend = r.sender)) " +
                     "AND f.status = 'accepted')")
       List<Recommendation> findRecommendationsBetweenFriends();

       
       void deleteByBook(Book book);

       
       void deleteBySender(User sender);

       
       void deleteByReceiver(User receiver);

       
       long countByReceiverAndIsReadFalse(User receiver);

       
       List<Recommendation> findByReceiverAndIsReadFalse(User receiver);
}
