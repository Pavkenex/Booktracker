package com.booktracker.service;

import com.booktracker.dto.FriendshipResponse;
import com.booktracker.entity.Friendship;
import com.booktracker.entity.User;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.FriendshipRepository;
import com.booktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FriendshipService {
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Send a friend request
     */
    public FriendshipResponse sendFriendRequest(Long userId, Long friendId) {
        if (userId.equals(friendId)) {
            throw new IllegalArgumentException("Cannot send friend request to yourself");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend not found"));
        
        // Check if friendship already exists (pending or accepted)
        if (friendshipRepository.friendshipExists(user, friend)) {
            throw new IllegalArgumentException("Friendship already exists between users");
        }
        
        // Check if there's a rejected friendship and remove it to allow new request
        friendshipRepository.findFriendshipBetweenUsers(user, friend).ifPresent(existingFriendship -> {
            if (existingFriendship.getStatus() == Friendship.FriendshipStatus.rejected) {
                friendshipRepository.delete(existingFriendship);
            }
        });
        
        Friendship friendship = new Friendship(user, friend);
        friendship = friendshipRepository.save(friendship);
        
        return new FriendshipResponse(friendship);
    }
    
    /**
     * Accept a friend request
     */
    public FriendshipResponse acceptFriendRequest(Long userId, Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));
        
        // Verify that the current user is the receiver of the friend request
        if (!friendship.getFriend().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only accept friend requests sent to you");
        }
        
        if (friendship.getStatus() != Friendship.FriendshipStatus.pending) {
            throw new IllegalArgumentException("Friend request is not pending");
        }
        
        friendship.setStatus(Friendship.FriendshipStatus.accepted);
        friendship = friendshipRepository.save(friendship);
        
        return new FriendshipResponse(friendship);
    }
    
    /**
     * Decline a friend request
     */
    public void declineFriendRequest(Long userId, Long friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend request not found"));
        
        // Verify that the current user is the receiver of the friend request
        if (!friendship.getFriend().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only decline friend requests sent to you");
        }
        
        if (friendship.getStatus() != Friendship.FriendshipStatus.pending) {
            throw new IllegalArgumentException("Friend request is not pending");
        }
        
        friendship.setStatus(Friendship.FriendshipStatus.rejected);
        friendshipRepository.save(friendship);
    }
    
    /**
     * Remove a friend (unfriend)
     */
    public void removeFriend(Long userId, Long friendId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new ResourceNotFoundException("Friend not found"));
        
        if (!friendshipRepository.areFriends(user, friend)) {
            throw new IllegalArgumentException("Users are not friends");
        }
        
        friendshipRepository.deleteFriendshipBetweenUsers(user, friend);
    }
    
    /**
     * Get user's friends
     */
    @Transactional(readOnly = true)
    public List<User> getFriends(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return friendshipRepository.findFriendsOfUser(user);
    }
    
    /**
     * Get pending friend requests sent by user
     */
    @Transactional(readOnly = true)
    public List<FriendshipResponse> getSentFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Friendship> friendships = friendshipRepository.findByUserAndStatus(user, Friendship.FriendshipStatus.pending);
        return friendships.stream()
                .map(FriendshipResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get pending friend requests received by user
     */
    @Transactional(readOnly = true)
    public List<FriendshipResponse> getReceivedFriendRequests(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Friendship> friendships = friendshipRepository.findByFriendAndStatus(user, Friendship.FriendshipStatus.pending);
        return friendships.stream()
                .map(FriendshipResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if two users are friends
     */
    @Transactional(readOnly = true)
    public boolean areFriends(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return friendshipRepository.areFriends(user1, user2);
    }
    
    /**
     * Get mutual friends between two users
     */
    @Transactional(readOnly = true)
    public List<User> getMutualFriends(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return friendshipRepository.findMutualFriends(user1, user2);
    }
    
    /**
     * Get friend count for user
     */
    @Transactional(readOnly = true)
    public long getFriendCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return friendshipRepository.countFriendsOfUser(user);
    }
    
    /**
     * Get pending friend request count for user
     */
    @Transactional(readOnly = true)
    public long getPendingRequestCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        long count = friendshipRepository.countByFriendAndStatus(user, Friendship.FriendshipStatus.pending);
        System.out.println("Pending friend request count for user " + userId + " (" + user.getUsername() + "): " + count);
        return count;
    }
    
    /**
     * Get user's friendships (with friend details)
     */
    @Transactional(readOnly = true)
    public List<FriendshipResponse> getFriendships(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Friendship> friendships = friendshipRepository.findAcceptedFriendshipsOfUser(user);
        return friendships.stream()
                .map(FriendshipResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Search users by username or email
     */
    @Transactional(readOnly = true)
    public List<User> searchUsers(String query, Long currentUserId) {
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .limit(10)
                .collect(Collectors.toList());
    }
    
    /**
     * Check if there's a pending friend request between users
     */
    @Transactional(readOnly = true)
    public boolean hasPendingRequest(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return friendshipRepository.hasPendingRequest(user1, user2);
    }
}