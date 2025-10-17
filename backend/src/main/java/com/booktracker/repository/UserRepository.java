package com.booktracker.repository;

import com.booktracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    
    Optional<User> findByUsername(String username);
    
    
    Optional<User> findByEmail(String email);
    
    
    boolean existsByUsername(String username);
    
    
    boolean existsByEmail(String email);
    
    
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);
    
    
    @Query("SELECT u FROM User u WHERE u.isAdmin = true")
    java.util.List<User> findAllAdmins();
    
    
    @Query("SELECT COUNT(u) FROM User u")
    long countTotalUsers();
    
    
    @Query("SELECT COUNT(u) FROM User u WHERE CAST(u.createdAt AS date) = CURRENT_DATE")
    long countUsersRegisteredToday();
    
    
    @Query("SELECT COUNT(u) FROM User u WHERE CAST(u.createdAt AS date) = :date")
    long countUsersRegisteredOnDate(@Param("date") java.time.LocalDate date);
    
    
    List<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);
    
    
    @Query("SELECT u.username, u.email, " +
           "COUNT(DISTINCT ub.id) as totalBooks, " +
           "COUNT(DISTINCT CASE WHEN ub.status = 'read' THEN ub.id END) as booksRead, " +
           "COUNT(DISTINCT CASE WHEN ub.status = 'to_read' THEN ub.id END) as booksToRead, " +
           "COUNT(DISTINCT f.id) as friendsCount, " +
           "COUNT(DISTINCT r.id) as recommendationsSent, " +
           "AVG(CASE WHEN ub.rating IS NOT NULL THEN ub.rating END) as averageRating, " +
           "COUNT(DISTINCT CASE WHEN ub.review IS NOT NULL THEN ub.id END) as reviewsWritten " +
           "FROM User u " +
           "LEFT JOIN u.userBooks ub " +
           "LEFT JOIN u.sentFriendRequests f ON f.status = 'accepted' " +
           "LEFT JOIN u.sentRecommendations r " +
           "WHERE u.isAdmin = false " +
           "GROUP BY u.id, u.username, u.email " +
           "ORDER BY totalBooks DESC")
    List<Object[]> getUserEngagementData();
}
