package com.booktracker.service;

import com.booktracker.dto.BookResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.BookView;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.BookViewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PopularityService {

    private static final Logger logger = LoggerFactory.getLogger(PopularityService.class);

    @Autowired
    private BookViewRepository bookViewRepository;

    @Autowired
    private BookRepository bookRepository;

    /**
     * Record a book view by incrementing the view count atomically
     * @param bookId the ID of the book being viewed
     * @throws ResourceNotFoundException if the book doesn't exist
     */
    public void recordBookView(Long bookId) {
        logger.debug("Recording view for book ID: {}", bookId);
        
        // Verify book exists first
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));
        
        try {
            // Find existing BookView or create new one
            Optional<BookView> existingBookView = bookViewRepository.findByBookId(bookId);
            
            if (existingBookView.isPresent()) {
                // Increment existing view count
                BookView bookView = existingBookView.get();
                bookView.incrementViewCount();
                bookViewRepository.save(bookView);
                logger.debug("Incremented view count for book ID: {} to {}", bookId, bookView.getViewCount());
            } else {
                // Create new BookView with initial count of 1
                BookView newBookView = new BookView(book, 1L);
                bookViewRepository.save(newBookView);
                logger.debug("Created new BookView for book ID: {} with initial count: 1", bookId);
            }
        } catch (Exception e) {
            logger.error("Failed to record view for book ID: {}", bookId, e);
            // Don't rethrow - view recording should not break the main functionality
        }
    }

    /**
     * Get the most popular books based on view count
     * @param limit maximum number of books to return
     * @return list of BookResponse objects with view counts, ordered by popularity
     */
    @Transactional(readOnly = true)
    public List<BookResponse> getMostPopularBooks(int limit) {
        logger.debug("Fetching top {} most popular books", limit);
        
        try {
            List<BookView> topBookViews;
            
            if (limit <= 10) {
                // Use optimized query for top 10
                topBookViews = bookViewRepository.findTop10ByOrderByViewCountDesc();
                // Limit to requested size if less than 10
                if (limit < 10 && topBookViews.size() > limit) {
                    topBookViews = topBookViews.subList(0, limit);
                }
            } else {
                // For larger limits, get all and limit manually
                List<BookView> allBookViews = bookViewRepository.findAllByOrderByViewCountDesc();
                topBookViews = allBookViews.stream()
                        .limit(limit)
                        .collect(Collectors.toList());
            }
            
            List<BookResponse> popularBooks = topBookViews.stream()
                    .map(bookView -> new BookResponse(bookView.getBook(), bookView.getViewCount()))
                    .collect(Collectors.toList());
            
            logger.debug("Retrieved {} popular books", popularBooks.size());
            return popularBooks;
            
        } catch (Exception e) {
            logger.error("Failed to fetch popular books", e);
            // Return empty list on error to avoid breaking the UI
            return List.of();
        }
    }

    /**
     * Get popularity statistics for admin functionality
     * @return list of all books with their view counts, ordered by popularity
     */
    @Transactional(readOnly = true)
    public List<BookResponse> getPopularityStatistics() {
        logger.debug("Fetching popularity statistics for admin");
        
        try {
            List<BookView> allBookViews = bookViewRepository.findAllByOrderByViewCountDesc();
            
            List<BookResponse> statistics = allBookViews.stream()
                    .map(bookView -> new BookResponse(bookView.getBook(), bookView.getViewCount()))
                    .collect(Collectors.toList());
            
            logger.debug("Retrieved popularity statistics for {} books", statistics.size());
            return statistics;
            
        } catch (Exception e) {
            logger.error("Failed to fetch popularity statistics", e);
            // Return empty list on error
            return List.of();
        }
    }

    /**
     * Get view count for a specific book
     * @param bookId the ID of the book
     * @return the view count, or 0 if no views recorded
     */
    @Transactional(readOnly = true)
    public Long getBookViewCount(Long bookId) {
        logger.debug("Getting view count for book ID: {}", bookId);
        
        try {
            return bookViewRepository.findByBookId(bookId)
                    .map(BookView::getViewCount)
                    .orElse(0L);
        } catch (Exception e) {
            logger.error("Failed to get view count for book ID: {}", bookId, e);
            return 0L;
        }
    }

    /**
     * Get total view count across all books
     * @return total number of views across all books
     */
    @Transactional(readOnly = true)
    public Long getTotalViewCount() {
        logger.debug("Getting total view count across all books");
        
        try {
            Long totalViews = bookViewRepository.getTotalViewCount();
            logger.debug("Total view count: {}", totalViews);
            return totalViews;
        } catch (Exception e) {
            logger.error("Failed to get total view count", e);
            return 0L;
        }
    }

    /**
     * Check if a book has any recorded views
     * @param bookId the ID of the book
     * @return true if the book has views, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean hasBookViews(Long bookId) {
        logger.debug("Checking if book ID: {} has views", bookId);
        
        try {
            return bookViewRepository.existsByBookId(bookId);
        } catch (Exception e) {
            logger.error("Failed to check views for book ID: {}", bookId, e);
            return false;
        }
    }
}