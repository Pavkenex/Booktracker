package com.booktracker.service;

import com.booktracker.dto.FriendshipResponse;
import com.booktracker.entity.Friendship;
import com.booktracker.entity.User;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.FriendshipRepository;
import com.booktracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FriendshipServiceTest {
    
    @Mock
    private FriendshipRepository friendshipRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private FriendshipService friendshipService;
    
    private User user1;
    private User user2;
    private Friendship friendship;
    
    @BeforeEach
    void setUp() {
        user1 = new User();
        user1.setId(1L);
        user1.setUsername("user1");
        user1.setEmail("user1@example.com");
        
        user2 = new User();
        user2.setId(2L);
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");
        
        friendship = new Friendship(user1, user2);
        friendship.setId(1L);
    }
    
    @Test
    void sendFriendRequest_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(friendshipRepository.friendshipExists(user1, user2)).thenReturn(false);
        when(friendshipRepository.save(any(Friendship.class))).thenReturn(friendship);
        
        // When
        FriendshipResponse result = friendshipService.sendFriendRequest(1L, 2L);
        
        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("pending", result.getStatus());
        verify(friendshipRepository).save(any(Friendship.class));
    }
    
    @Test
    void sendFriendRequest_ToSelf_ThrowsException() {
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> friendshipService.sendFriendRequest(1L, 1L)
        );
        assertEquals("Cannot send friend request to yourself", exception.getMessage());
    }
    
    @Test
    void sendFriendRequest_UserNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> friendshipService.sendFriendRequest(1L, 2L));
    }
    
    @Test
    void sendFriendRequest_FriendshipExists_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(friendshipRepository.friendshipExists(user1, user2)).thenReturn(true);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> friendshipService.sendFriendRequest(1L, 2L)
        );
        assertEquals("Friendship already exists between users", exception.getMessage());
    }
    
    @Test
    void acceptFriendRequest_Success() {
        // Given
        when(friendshipRepository.findById(1L)).thenReturn(Optional.of(friendship));
        when(friendshipRepository.save(any(Friendship.class))).thenReturn(friendship);
        
        // When
        FriendshipResponse result = friendshipService.acceptFriendRequest(2L, 1L);
        
        // Then
        assertNotNull(result);
        assertEquals(Friendship.FriendshipStatus.accepted, friendship.getStatus());
        verify(friendshipRepository).save(friendship);
    }
    
    @Test
    void acceptFriendRequest_NotReceiver_ThrowsException() {
        // Given
        when(friendshipRepository.findById(1L)).thenReturn(Optional.of(friendship));
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> friendshipService.acceptFriendRequest(3L, 1L)
        );
        assertEquals("You can only accept friend requests sent to you", exception.getMessage());
    }
    
    @Test
    void acceptFriendRequest_NotPending_ThrowsException() {
        // Given
        friendship.setStatus(Friendship.FriendshipStatus.accepted);
        when(friendshipRepository.findById(1L)).thenReturn(Optional.of(friendship));
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> friendshipService.acceptFriendRequest(2L, 1L)
        );
        assertEquals("Friend request is not pending", exception.getMessage());
    }
    
    @Test
    void declineFriendRequest_Success() {
        // Given
        when(friendshipRepository.findById(1L)).thenReturn(Optional.of(friendship));
        when(friendshipRepository.save(any(Friendship.class))).thenReturn(friendship);
        
        // When
        friendshipService.declineFriendRequest(2L, 1L);
        
        // Then
        assertEquals(Friendship.FriendshipStatus.rejected, friendship.getStatus());
        verify(friendshipRepository).save(friendship);
    }
    
    @Test
    void removeFriend_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(friendshipRepository.areFriends(user1, user2)).thenReturn(true);
        
        // When
        friendshipService.removeFriend(1L, 2L);
        
        // Then
        verify(friendshipRepository).deleteFriendshipBetweenUsers(user1, user2);
    }
    
    @Test
    void removeFriend_NotFriends_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(friendshipRepository.areFriends(user1, user2)).thenReturn(false);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> friendshipService.removeFriend(1L, 2L)
        );
        assertEquals("Users are not friends", exception.getMessage());
    }
    
    @Test
    void getFriends_Success() {
        // Given
        List<User> friends = Arrays.asList(user2);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(friendshipRepository.findFriendsOfUser(user1)).thenReturn(friends);
        
        // When
        List<User> result = friendshipService.getFriends(1L);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(user2, result.get(0));
    }
    
    @Test
    void getSentFriendRequests_Success() {
        // Given
        List<Friendship> friendships = Arrays.asList(friendship);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(friendshipRepository.findByUserAndStatus(user1, Friendship.FriendshipStatus.pending))
                .thenReturn(friendships);
        
        // When
        List<FriendshipResponse> result = friendshipService.getSentFriendRequests(1L);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
    
    @Test
    void getReceivedFriendRequests_Success() {
        // Given
        List<Friendship> friendships = Arrays.asList(friendship);
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(friendshipRepository.findByFriendAndStatus(user2, Friendship.FriendshipStatus.pending))
                .thenReturn(friendships);
        
        // When
        List<FriendshipResponse> result = friendshipService.getReceivedFriendRequests(2L);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
    
    @Test
    void areFriends_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(friendshipRepository.areFriends(user1, user2)).thenReturn(true);
        
        // When
        boolean result = friendshipService.areFriends(1L, 2L);
        
        // Then
        assertTrue(result);
    }
    
    @Test
    void getMutualFriends_Success() {
        // Given
        User user3 = new User();
        user3.setId(3L);
        List<User> mutualFriends = Arrays.asList(user3);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(friendshipRepository.findMutualFriends(user1, user2)).thenReturn(mutualFriends);
        
        // When
        List<User> result = friendshipService.getMutualFriends(1L, 2L);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(user3, result.get(0));
    }
    
    @Test
    void getFriendCount_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(friendshipRepository.countFriendsOfUser(user1)).thenReturn(5L);
        
        // When
        long result = friendshipService.getFriendCount(1L);
        
        // Then
        assertEquals(5L, result);
    }
    
    @Test
    void getPendingRequestCount_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(friendshipRepository.countByFriendAndStatus(user1, Friendship.FriendshipStatus.pending))
                .thenReturn(3L);
        
        // When
        long result = friendshipService.getPendingRequestCount(1L);
        
        // Then
        assertEquals(3L, result);
    }
}