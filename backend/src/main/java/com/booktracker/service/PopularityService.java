package com.booktracker.service;

import com.booktracker.dto.BookResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.BookView;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.BookViewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PopularityService {

    private final BookViewRepository bookViewRepository;
    private final BookRepository bookRepository;

    public PopularityService(BookViewRepository bookViewRepository,
            BookRepository bookRepository) {
        this.bookViewRepository = bookViewRepository;
        this.bookRepository = bookRepository;
    }

    /**
     * Record a book view by incrementing the view count atomically
     * 
     * @param bookId the ID of the book being viewed
     * @throws ResourceNotFoundException if the book doesn't exist
     */
    public void recordBookView(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        try {
            Optional<BookView> existingBookView = bookViewRepository.findByBookId(bookId);

            if (existingBookView.isPresent()) {
                BookView bookView = existingBookView.get();
                bookView.incrementViewCount();
                bookViewRepository.save(bookView);
            } else {
                BookView newBookView = new BookView(book, 1L);
                bookViewRepository.save(newBookView);
            }
        } catch (Exception e) {
            // Don't rethrow - view recording should not break the main functionality
        }
    }

    /**
     * Get the most popular books based on view count
     * 
     * @param limit maximum number of books to return
     * @return list of BookResponse objects with view counts, ordered by popularity
     */
    @Transactional(readOnly = true)
    public List<BookResponse> getMostPopularBooks(int limit) {
        try {
            List<BookView> topBookViews;

            if (limit <= 10) {
                topBookViews = bookViewRepository.findTop10ByOrderByViewCountDesc();
                if (limit < 10 && topBookViews.size() > limit) {
                    topBookViews = topBookViews.subList(0, limit);
                }
            } else {
                List<BookView> allBookViews = bookViewRepository.findAllByOrderByViewCountDesc();
                topBookViews = allBookViews.stream()
                        .limit(limit)
                        .collect(Collectors.toList());
            }

            return topBookViews.stream()
                    .map(bookView -> new BookResponse(bookView.getBook(), bookView.getViewCount()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            // Return empty list on error to avoid breaking the UI
            return List.of();
        }
    }

    /**
     * Get popularity statistics for admin functionality
     * 
     * @return list of all books with their view counts, ordered by popularity
     */
    @Transactional(readOnly = true)
    public List<BookResponse> getPopularityStatistics() {
        try {
            List<BookView> allBookViews = bookViewRepository.findAllByOrderByViewCountDesc();

            return allBookViews.stream()
                    .map(bookView -> new BookResponse(bookView.getBook(), bookView.getViewCount()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            // Return empty list on error
            return List.of();
        }
    }

    /**
     * Get view count for a specific book
     * 
     * @param bookId the ID of the book
     * @return the view count, or 0 if no views recorded
     */
    @Transactional(readOnly = true)
    public Long getBookViewCount(Long bookId) {
        try {
            return bookViewRepository.findByBookId(bookId)
                    .map(BookView::getViewCount)
                    .orElse(0L);
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Get total view count across all books
     * 
     * @return total number of views across all books
     */
    @Transactional(readOnly = true)
    public Long getTotalViewCount() {
        try {
            return bookViewRepository.getTotalViewCount();
        } catch (Exception e) {
            return 0L;
        }
    }

    /**
     * Check if a book has any recorded views
     * 
     * @param bookId the ID of the book
     * @return true if the book has views, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean hasBookViews(Long bookId) {
        try {
            return bookViewRepository.existsByBookId(bookId);
        } catch (Exception e) {
            return false;
        }
    }
}