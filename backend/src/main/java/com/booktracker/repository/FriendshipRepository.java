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

       
       @Query("SELECT f FROM Friendship f WHERE " +
                     "(f.user = :user1 AND f.friend = :user2) OR " +
                     "(f.user = :user2 AND f.friend = :user1)")
       Optional<Friendship> findFriendshipBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

       
       Optional<Friendship> findByUserAndFriend(User user, User friend);

       
       @Query("SELECT f FROM Friendship f WHERE f.user = :user OR f.friend = :user")
       List<Friendship> findAllFriendshipsForUser(@Param("user") User user);

       
       @Query("SELECT f FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
       List<Friendship> findAcceptedFriendshipsForUser(@Param("user") User user);

       
       List<Friendship> findByUserAndStatus(User user, Friendship.FriendshipStatus status);

       
       List<Friendship> findByFriendAndStatus(User friend, Friendship.FriendshipStatus status);

       
       @Query("SELECT CASE WHEN f.user = :user THEN f.friend ELSE f.user END " +
                     "FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
       List<User> findFriendsOfUser(@Param("user") User user);

       
       @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
                     "((f.user = :user1 AND f.friend = :user2) OR (f.user = :user2 AND f.friend = :user1)) " +
                     "AND f.status = 'accepted'")
       boolean areFriends(@Param("user1") User user1, @Param("user2") User user2);

       
       @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
                     "((f.user = :user1 AND f.friend = :user2) OR " +
                     "(f.user = :user2 AND f.friend = :user1)) " +
                     "AND f.status IN ('pending', 'accepted')")
       boolean friendshipExists(@Param("user1") User user1, @Param("user2") User user2);

       
       @Query("SELECT COUNT(f) FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
       long countFriendsOfUser(@Param("user") User user);

       
       long countByFriendAndStatus(User friend, Friendship.FriendshipStatus status);

       
       @Query("DELETE FROM Friendship f WHERE " +
                     "(f.user = :user1 AND f.friend = :user2) OR " +
                     "(f.user = :user2 AND f.friend = :user1)")
       void deleteFriendshipBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);

       
       @Query("SELECT COUNT(f) FROM Friendship f WHERE CAST(f.createdAt AS date) = CURRENT_DATE")
       long countFriendRequestsSentToday();

       
       @Query("SELECT COUNT(f) FROM Friendship f WHERE CAST(f.createdAt AS date) = :date")
       long countFriendRequestsSentOnDate(@Param("date") java.time.LocalDate date);

       
       @Query("SELECT f FROM Friendship f WHERE (f.user = :user OR f.friend = :user) AND f.status = 'accepted'")
       List<Friendship> findAcceptedFriendshipsOfUser(@Param("user") User user);

       
       @Query("SELECT COUNT(f) > 0 FROM Friendship f WHERE " +
                     "((f.user = :user1 AND f.friend = :user2) OR (f.user = :user2 AND f.friend = :user1)) " +
                     "AND f.status = 'pending'")
       boolean hasPendingRequest(@Param("user1") User user1, @Param("user2") User user2);
}
