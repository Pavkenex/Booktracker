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
    
    
    Optional<UserBook> findByUserAndBook(User user, Book book);
    
    
    Optional<UserBook> findByUserIdAndBookId(Long userId, Long bookId);
    
    
    List<UserBook> findByUser(User user);
    
    
    Page<UserBook> findByUser(User user, Pageable pageable);
    
    
    List<UserBook> findByUserAndStatus(User user, UserBook.ReadingStatus status);
    
    
    Page<UserBook> findByUserAndStatus(User user, UserBook.ReadingStatus status, Pageable pageable);
    
    
    List<UserBook> findByUserAndIsFavouriteTrue(User user);
    
    
    Page<UserBook> findByUserAndIsFavouriteTrue(User user, Pageable pageable);
    
    
    List<UserBook> findByUserAndRatingIsNotNull(User user);
    
    
    List<UserBook> findByUserAndRating(User user, Integer rating);
    
    
    boolean existsByUserAndBook(User user, Book book);
    
    
    boolean existsByUserIdAndBookId(Long userId, Long bookId);
    
    
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.user = :user AND ub.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") UserBook.ReadingStatus status);
    
    
    long countByUser(User user);
    
    
    long countByUserAndIsFavouriteTrue(User user);
    
    
    @Query("SELECT ub FROM UserBook ub WHERE ub.user = :user AND ub.status = 'read' " +
           "AND ub.readDate BETWEEN :startDate AND :endDate")
    List<UserBook> findBooksReadBetweenDates(@Param("user") User user,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
    
    
    @Query("SELECT ub FROM UserBook ub WHERE ub.user = :user ORDER BY ub.id DESC")
    List<UserBook> findRecentActivity(@Param("user") User user, Pageable pageable);
    
    
    @Query("SELECT ub.status, COUNT(ub) FROM UserBook ub WHERE ub.user = :user GROUP BY ub.status")
    List<Object[]> getUserReadingStatistics(@Param("user") User user);
    
    
    @Query("SELECT ub.rating, COUNT(ub) FROM UserBook ub WHERE ub.user = :user AND ub.rating IS NOT NULL GROUP BY ub.rating ORDER BY ub.rating")
    List<Object[]> getUserRatingDistribution(@Param("user") User user);
    
    
    @Query("SELECT ub.book, COUNT(ub) as userCount FROM UserBook ub GROUP BY ub.book ORDER BY userCount DESC")
    List<Object[]> findMostPopularBooks(Pageable pageable);
    
    
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE CAST(ub.readDate AS date) = CURRENT_DATE")
    long countBooksAddedToday();
    
    
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE CAST(ub.readDate AS date) = :date")
    long countBooksAddedOnDate(@Param("date") LocalDate date);
    
    
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.review IS NOT NULL AND CAST(ub.readDate AS date) = CURRENT_DATE")
    long countReviewsPostedToday();
    
    
    @Query("SELECT COUNT(ub) FROM UserBook ub WHERE ub.review IS NOT NULL AND CAST(ub.readDate AS date) = :date")
    long countReviewsPostedOnDate(@Param("date") LocalDate date);
    
    
    @Query("SELECT AVG(CAST(ub.rating AS double)) FROM UserBook ub WHERE ub.book.id = :bookId AND ub.rating IS NOT NULL")
    Double getAverageRatingForBook(@Param("bookId") Long bookId);
    
    
    @Query("SELECT ub.book.id, AVG(CAST(ub.rating AS double)) FROM UserBook ub WHERE ub.book.id IN :bookIds AND ub.rating IS NOT NULL GROUP BY ub.book.id")
    List<Object[]> getAverageRatingsForBooks(@Param("bookIds") List<Long> bookIds);

    
    @Query("SELECT ub FROM UserBook ub WHERE ub.book.id = :bookId AND ub.review IS NOT NULL ORDER BY ub.id DESC")
    Page<UserBook> findRecentReviewsForBook(@Param("bookId") Long bookId, Pageable pageable);
    
    
    @Query("SELECT AVG(CAST(ub.rating AS double)) FROM UserBook ub WHERE ub.rating IS NOT NULL")
    Double getGlobalAverageRating();
    
    
    long countByReviewIsNotNull();
    
    
    long countByStatus(UserBook.ReadingStatus status);
}
