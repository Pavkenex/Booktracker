package com.booktracker.repository;

import com.booktracker.entity.Friendship;
import com.booktracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    
    /**
     * Find friendship between two users (either direction)
     */
    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.user = :user1 AND f.friend = :user2) OR " +
           "(f.user = :user2 AND f.friend = :user1)")
    Optional<Friendship> findFriendshipBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    /**
     * Find friendship by user and friend
     */
    Optional<Friendship> findByUserAndFriend(User user, User friend);
    
    /**
     * Find all friendships for a user (sent and received)
     */
    @Query("SELECT f FROM Friendship f WHERE f.user = :user OR f.friend = :user")
    List<Friendship> findAllFriendshipsForUser(@Param("user") User user);
    
    /**
     * Find accepted friendships for a user
     */
    @Query("SELECT f FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
    List<Friendship> findAcceptedFriendshipsForUser(@Param("user") User user);
    
    /**
     * Find pending friend requests sent by user
     */
    List<Friendship> findByUserAndStatus(User user, Friendship.FriendshipStatus status);
    
    /**
     * Find pending friend requests received by user
     */
    List<Friendship> findByFriendAndStatus(User friend, Friendship.FriendshipStatus status);
    
    /**
     * Find all friends of a user (accepted friendships)
     */
    @Query("SELECT CASE WHEN f.user = :user THEN f.friend ELSE f.user END " +
           "FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
    List<User> findFriendsOfUser(@Param("user") User user);
    
    /**
     * Check if two users are friends
     */
    @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
           "((f.user = :user1 AND f.friend = :user2) OR (f.user = :user2 AND f.friend = :user1)) " +
           "AND f.status = 'accepted'")
    boolean areFriends(@Param("user1") User user1, @Param("user2") User user2);
    
    /**
     * Check if friendship exists between users (pending or accepted status only)
     */
    @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
           "((f.user = :user1 AND f.friend = :user2) OR " +
           "(f.user = :user2 AND f.friend = :user1)) " +
           "AND f.status IN ('pending', 'accepted')")
    boolean friendshipExists(@Param("user1") User user1, @Param("user2") User user2);
    
    /**
     * Count user's friends
     */
    @Query("SELECT COUNT(f) FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
    long countFriendsOfUser(@Param("user") User user);
    
    /**
     * Count pending friend requests for user
     */
    long countByFriendAndStatus(User friend, Friendship.FriendshipStatus status);
    
    /**
     * Find mutual friends between two users
     */
    @Query("SELECT DISTINCT u FROM User u WHERE u IN " +
           "(SELECT CASE WHEN f1.user = :user1 THEN f1.friend ELSE f1.user END " +
           "FROM Friendship f1 WHERE (f1.user = :user1 OR f1.friend = :user1) AND f1.status = 'accepted') " +
           "AND u IN " +
           "(SELECT CASE WHEN f2.user = :user2 THEN f2.friend ELSE f2.user END " +
           "FROM Friendship f2 WHERE (f2.user = :user2 OR f2.friend = :user2) AND f2.status = 'accepted')")
    List<User> findMutualFriends(@Param("user1") User user1, @Param("user2") User user2);
    
    /**
     * Delete friendship between two users (either direction)
     */
    @Query("DELETE FROM Friendship f WHERE " +
           "(f.user = :user1 AND f.friend = :user2) OR " +
           "(f.user = :user2 AND f.friend = :user1)")
    void deleteFriendshipBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
    
    /**
     * Count friend requests sent today
     */
    @Query("SELECT COUNT(f) FROM Friendship f WHERE CAST(f.createdAt AS date) = CURRENT_DATE")
    long countFriendRequestsSentToday();
    
    /**
     * Count friend requests sent on specific date
     */
    @Query("SELECT COUNT(f) FROM Friendship f WHERE CAST(f.createdAt AS date) = :date")
    long countFriendRequestsSentOnDate(@Param("date") java.time.LocalDate date);
    
    /**
     * Find accepted friendships of user (returns Friendship objects)
     */
    @Query("SELECT f FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
    List<Friendship> findAcceptedFriendshipsOfUser(@Param("user") User user);
    
    /**
     * Check if there's a pending friend request between users
     */
    @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
           "((f.user = :user1 AND f.friend = :user2) OR (f.user = :user2 AND f.friend = :user1)) " +
           "AND f.status = 'pending'")
    boolean hasPendingRequest(@Param("user1") User user1, @Param("user2") User user2);
}