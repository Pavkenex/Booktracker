package com.booktracker.service;

import com.booktracker.dto.RecommendationResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.Recommendation;
import com.booktracker.entity.User;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.FriendshipRepository;
import com.booktracker.repository.RecommendationRepository;
import com.booktracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {
    
    @Mock
    private RecommendationRepository recommendationRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private BookRepository bookRepository;
    
    @Mock
    private FriendshipRepository friendshipRepository;
    
    @InjectMocks
    private RecommendationService recommendationService;
    
    private User sender;
    private User receiver;
    private Book book;
    private Recommendation recommendation;
    
    @BeforeEach
    void setUp() {
        sender = new User();
        sender.setId(1L);
        sender.setUsername("sender");
        sender.setEmail("sender@example.com");
        
        receiver = new User();
        receiver.setId(2L);
        receiver.setUsername("receiver");
        receiver.setEmail("receiver@example.com");
        
        book = new Book();
        book.setId(1L);
        book.setTitle("Test Book");
        book.setAuthor("Test Author");
        
        recommendation = new Recommendation(sender, receiver, book, "Great book!");
        recommendation.setId(1L);
        recommendation.setCreatedAt(LocalDateTime.now());
    }
    
    @Test
    void sendRecommendation_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(friendshipRepository.areFriends(sender, receiver)).thenReturn(true);
        when(recommendationRepository.existsBySenderAndReceiverAndBook(sender, receiver, book)).thenReturn(false);
        when(recommendationRepository.save(any(Recommendation.class))).thenReturn(recommendation);
        
        // When
        RecommendationResponse result = recommendationService.sendRecommendation(1L, 2L, 1L, "Great book!");
        
        // Then
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Great book!", result.getMessage());
        verify(recommendationRepository).save(any(Recommendation.class));
    }
    
    @Test
    void sendRecommendation_SenderNotFound_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        
        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> recommendationService.sendRecommendation(1L, 2L, 1L, "Great book!"));
    }
    
    @Test
    void sendRecommendation_NotFriends_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(friendshipRepository.areFriends(sender, receiver)).thenReturn(false);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> recommendationService.sendRecommendation(1L, 2L, 1L, "Great book!")
        );
        assertEquals("You can only send recommendations to friends", exception.getMessage());
    }
    
    @Test
    void sendRecommendation_AlreadyRecommended_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(friendshipRepository.areFriends(sender, receiver)).thenReturn(true);
        when(recommendationRepository.existsBySenderAndReceiverAndBook(sender, receiver, book)).thenReturn(true);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> recommendationService.sendRecommendation(1L, 2L, 1L, "Great book!")
        );
        assertEquals("You have already recommended this book to this user", exception.getMessage());
    }
    
    @Test
    void getSentRecommendations_Success() {
        // Given
        List<Recommendation> recommendations = Arrays.asList(recommendation);
        Page<Recommendation> page = new PageImpl<>(recommendations);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(recommendationRepository.findBySender(eq(sender), any(Pageable.class))).thenReturn(page);
        
        // When
        List<RecommendationResponse> result = recommendationService.getSentRecommendations(1L, 0, 10);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
    
    @Test
    void getReceivedRecommendations_Success() {
        // Given
        List<Recommendation> recommendations = Arrays.asList(recommendation);
        Page<Recommendation> page = new PageImpl<>(recommendations);
        
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(recommendationRepository.findByReceiver(eq(receiver), any(Pageable.class))).thenReturn(page);
        
        // When
        List<RecommendationResponse> result = recommendationService.getReceivedRecommendations(2L, 0, 10);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
    
    @Test
    void getRecommendationsBetweenUsers_Success() {
        // Given
        List<Recommendation> recommendations = Arrays.asList(recommendation);
        Page<Recommendation> page = new PageImpl<>(recommendations);
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(friendshipRepository.areFriends(sender, receiver)).thenReturn(true);
        when(recommendationRepository.findBySenderAndReceiver(eq(sender), eq(receiver), any(Pageable.class)))
                .thenReturn(page);
        
        // When
        List<RecommendationResponse> result = recommendationService.getRecommendationsBetweenUsers(1L, 2L, 0, 10);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
    
    @Test
    void getRecommendationsBetweenUsers_NotFriends_ThrowsException() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(friendshipRepository.areFriends(sender, receiver)).thenReturn(false);
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> recommendationService.getRecommendationsBetweenUsers(1L, 2L, 0, 10)
        );
        assertEquals("Users must be friends to view recommendations", exception.getMessage());
    }
    
    @Test
    void getRecentRecommendations_Success() {
        // Given
        List<Recommendation> recommendations = Arrays.asList(recommendation);
        
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(recommendationRepository.findRecentRecommendationsForUser(eq(receiver), any(Pageable.class)))
                .thenReturn(recommendations);
        
        // When
        List<RecommendationResponse> result = recommendationService.getRecentRecommendations(2L, 5);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
    
    @Test
    void getRecommendationsForBook_Success() {
        // Given
        List<Recommendation> recommendations = Arrays.asList(recommendation);
        
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(recommendationRepository.findByBook(book)).thenReturn(recommendations);
        
        // When
        List<RecommendationResponse> result = recommendationService.getRecommendationsForBook(1L);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }
    
    @Test
    void deleteRecommendation_Success() {
        // Given
        when(recommendationRepository.findById(1L)).thenReturn(Optional.of(recommendation));
        
        // When
        recommendationService.deleteRecommendation(1L, 1L);
        
        // Then
        verify(recommendationRepository).delete(recommendation);
    }
    
    @Test
    void deleteRecommendation_NotSender_ThrowsException() {
        // Given
        when(recommendationRepository.findById(1L)).thenReturn(Optional.of(recommendation));
        
        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> recommendationService.deleteRecommendation(3L, 1L)
        );
        assertEquals("You can only delete your own recommendations", exception.getMessage());
    }
    
    @Test
    void getRecommendationStats_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(recommendationRepository.countBySender(sender)).thenReturn(5L);
        when(recommendationRepository.countByReceiver(sender)).thenReturn(3L);
        
        // When
        RecommendationService.RecommendationStats result = recommendationService.getRecommendationStats(1L);
        
        // Then
        assertEquals(5L, result.getSentCount());
        assertEquals(3L, result.getReceivedCount());
    }
    
    @Test
    void hasRecommended_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(recommendationRepository.existsBySenderAndReceiverAndBook(sender, receiver, book)).thenReturn(true);
        
        // When
        boolean result = recommendationService.hasRecommended(1L, 2L, 1L);
        
        // Then
        assertTrue(result);
    }
    
    @Test
    void getMostRecommendedBooks_Success() {
        // Given
        Object[] bookData = {book, 5L};
        List<Object[]> mostRecommended = Collections.singletonList(bookData);
        
        when(recommendationRepository.findMostRecommendedBooks(any(Pageable.class)))
                .thenReturn(mostRecommended);
        
        // When
        List<Object[]> result = recommendationService.getMostRecommendedBooks(10);
        
        // Then
        assertEquals(1, result.size());
        assertEquals(book, result.get(0)[0]);
        assertEquals(5L, result.get(0)[1]);
    }
}