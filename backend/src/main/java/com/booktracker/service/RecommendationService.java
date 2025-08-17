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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RecommendationService {
    
    @Autowired
    private RecommendationRepository recommendationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    /**
     * Send a book recommendation to a friend
     */
    public RecommendationResponse sendRecommendation(Long senderId, Long receiverId, Long bookId, String message) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        
        // Check if users are friends
        if (!friendshipRepository.areFriends(sender, receiver)) {
            throw new IllegalArgumentException("You can only send recommendations to friends");
        }
        
        // Check if recommendation already exists
        if (recommendationRepository.existsBySenderAndReceiverAndBook(sender, receiver, book)) {
            throw new IllegalArgumentException("You have already recommended this book to this user");
        }
        
        Recommendation recommendation = new Recommendation(sender, receiver, book, message);
        recommendation = recommendationRepository.save(recommendation);
        
        return new RecommendationResponse(recommendation);
    }
    
    /**
     * Get recommendations sent by user
     */
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getSentRecommendations(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Recommendation> recommendations = recommendationRepository.findBySender(user, pageable);
        
        return recommendations.getContent().stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get recommendations received by user
     */
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getReceivedRecommendations(Long userId, int page, int size) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Recommendation> recommendations = recommendationRepository.findByReceiver(user, pageable);
        
        return recommendations.getContent().stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get recommendations between two users
     */
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendationsBetweenUsers(Long userId1, Long userId2, int page, int size) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if users are friends
        if (!friendshipRepository.areFriends(user1, user2)) {
            throw new IllegalArgumentException("Users must be friends to view recommendations");
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Recommendation> recommendations = recommendationRepository.findBySenderAndReceiver(user1, user2, pageable);
        
        return recommendations.getContent().stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get recent recommendations for user
     */
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecentRecommendations(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Pageable pageable = PageRequest.of(0, limit);
        List<Recommendation> recommendations = recommendationRepository.findRecentRecommendationsForUser(user, pageable);
        
        return recommendations.stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get recommendations for a specific book
     */
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendationsForBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        
        List<Recommendation> recommendations = recommendationRepository.findByBook(book);
        
        return recommendations.stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Delete a recommendation
     */
    public void deleteRecommendation(Long userId, Long recommendationId) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));
        
        // Allow either sender or receiver to delete (receiver "dismisses" it)
        Long senderId = recommendation.getSender().getId();
        Long receiverId = recommendation.getReceiver().getId();
        if (!senderId.equals(userId) && !receiverId.equals(userId)) {
            throw new IllegalArgumentException("You can only delete recommendations you sent or received");
        }

        recommendationRepository.delete(recommendation); // hard delete for simplicity
    }
    
    /**
     * Get recommendation statistics for user
     */
    @Transactional(readOnly = true)
    public RecommendationStats getRecommendationStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        long sentCount = recommendationRepository.countBySender(user);
        long receivedCount = recommendationRepository.countByReceiver(user);
        
        return new RecommendationStats(sentCount, receivedCount);
    }
    
    /**
     * Check if user has recommended a book to another user
     */
    @Transactional(readOnly = true)
    public boolean hasRecommended(Long senderId, Long receiverId, Long bookId) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));
        
        return recommendationRepository.existsBySenderAndReceiverAndBook(sender, receiver, book);
    }
    
    /**
     * Get most recommended books
     */
    @Transactional(readOnly = true)
    public List<Object[]> getMostRecommendedBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return recommendationRepository.findMostRecommendedBooks(pageable);
    }
    
    /**
     * Get count of unread recommendations for user
     */
    @Transactional(readOnly = true)
    public long getUnreadRecommendationCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return recommendationRepository.countByReceiverAndIsReadFalse(user);
    }
    
    /**
     * Mark recommendation as read
     */
    public void markRecommendationAsRead(Long userId, Long recommendationId) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));
        
        // Only the receiver can mark their recommendation as read
        if (!recommendation.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only mark your own recommendations as read");
        }
        
        recommendation.setRead(true);
        recommendationRepository.save(recommendation);
    }
    
    /**
     * Inner class for recommendation statistics
     */
    public static class RecommendationStats {
        private final long sentCount;
        private final long receivedCount;
        
        public RecommendationStats(long sentCount, long receivedCount) {
            this.sentCount = sentCount;
            this.receivedCount = receivedCount;
        }
        
        public long getSentCount() {
            return sentCount;
        }
        
        public long getReceivedCount() {
            return receivedCount;
        }
    }
}