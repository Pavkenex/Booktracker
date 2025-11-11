package com.booktracker.service;

import com.booktracker.dto.BookResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.BookView;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.BookViewRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
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

    
    @Async
    public CompletableFuture<Void> recordBookViewAsync(Long bookId) {
        try {
            recordBookView(bookId);
        } catch (Exception e) {
            
        }
        return CompletableFuture.completedFuture(null);
    }

    
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
           
        }
    }

    
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
           
            return List.of();
        }
    }

    
    @Transactional(readOnly = true)
    public List<BookResponse> getPopularityStatistics() {
        try {
            List<BookView> allBookViews = bookViewRepository.findAllByOrderByViewCountDesc();

            return allBookViews.stream()
                    .map(bookView -> new BookResponse(bookView.getBook(), bookView.getViewCount()))
                    .collect(Collectors.toList());

        } catch (Exception e) {
           
            return List.of();
        }
    }

    
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

    
    @Transactional(readOnly = true)
    public Long getTotalViewCount() {
        try {
            return bookViewRepository.getTotalViewCount();
        } catch (Exception e) {
            return 0L;
        }
    }

    
    @Transactional(readOnly = true)
    public boolean hasBookViews(Long bookId) {
        try {
            return bookViewRepository.existsByBookId(bookId);
        } catch (Exception e) {
            return false;
        }
    }
}
