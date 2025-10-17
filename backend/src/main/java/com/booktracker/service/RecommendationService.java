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

    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final FriendshipRepository friendshipRepository;

    public RecommendationService(RecommendationRepository recommendationRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            FriendshipRepository friendshipRepository) {
        this.recommendationRepository = recommendationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.friendshipRepository = friendshipRepository;
    }

    
    public RecommendationResponse sendRecommendation(Long senderId, Long receiverId, Long bookId, String message) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (!friendshipRepository.areFriends(sender, receiver)) {
            throw new IllegalArgumentException("You can only send recommendations to friends");
        }

        if (recommendationRepository.existsBySenderAndReceiverAndBook(sender, receiver, book)) {
            throw new IllegalArgumentException("You have already recommended this book to this user");
        }

        Recommendation recommendation = new Recommendation(sender, receiver, book, message);
        recommendation = recommendationRepository.save(recommendation);

        return new RecommendationResponse(recommendation);
    }

    
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

    
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendationsBetweenUsers(Long userId1, Long userId2, int page, int size) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!friendshipRepository.areFriends(user1, user2)) {
            throw new IllegalArgumentException("Users must be friends to view recommendations");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Recommendation> recommendations = recommendationRepository.findBySenderAndReceiver(user1, user2, pageable);

        return recommendations.getContent().stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecentRecommendations(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Pageable pageable = PageRequest.of(0, limit);
        List<Recommendation> recommendations = recommendationRepository.findRecentRecommendationsForUser(user,
                pageable);

        return recommendations.stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public List<RecommendationResponse> getRecommendationsForBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        List<Recommendation> recommendations = recommendationRepository.findByBook(book);

        return recommendations.stream()
                .map(RecommendationResponse::new)
                .collect(Collectors.toList());
    }

    
    public void deleteRecommendation(Long userId, Long recommendationId) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));

       
        Long senderId = recommendation.getSender().getId();
        Long receiverId = recommendation.getReceiver().getId();
        if (!senderId.equals(userId) && !receiverId.equals(userId)) {
            throw new IllegalArgumentException("You can only delete recommendations you sent or received");
        }

        recommendationRepository.delete(recommendation);
    }

    
    @Transactional(readOnly = true)
    public RecommendationStats getRecommendationStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long sentCount = recommendationRepository.countBySender(user);
        long receivedCount = recommendationRepository.countByReceiver(user);

        return new RecommendationStats(sentCount, receivedCount);
    }

    
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

    
    @Transactional(readOnly = true)
    public List<Object[]> getMostRecommendedBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return recommendationRepository.findMostRecommendedBooks(pageable);
    }

    
    @Transactional(readOnly = true)
    public long getUnreadRecommendationCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return recommendationRepository.countByReceiverAndIsReadFalse(user);
    }

    
    public void markRecommendationAsRead(Long userId, Long recommendationId) {
        Recommendation recommendation = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found"));

       
        if (!recommendation.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only mark your own recommendations as read");
        }

        recommendation.setRead(true);
        recommendationRepository.save(recommendation);
    }

    
    public void markAllRecommendationsAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Recommendation> unreadRecommendations = recommendationRepository.findByReceiverAndIsReadFalse(user);

        for (Recommendation recommendation : unreadRecommendations) {
            recommendation.setRead(true);
        }

        if (!unreadRecommendations.isEmpty()) {
            recommendationRepository.saveAll(unreadRecommendations);
        }
    }

    
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
