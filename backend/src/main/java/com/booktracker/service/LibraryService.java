package com.booktracker.service;

import com.booktracker.dto.LibraryStatsResponse;
import com.booktracker.dto.UserBookRequest;
import com.booktracker.dto.UserBookResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.User;
import com.booktracker.entity.UserBook;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.UserBookRepository;
import com.booktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class LibraryService {
    
    @Autowired
    private UserBookRepository userBookRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Add a book to user's library
     */
    public UserBookResponse addBookToLibrary(Long userId, UserBookRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        // Check if book already exists in user's library
        Optional<UserBook> existingUserBook = userBookRepository.findByUserAndBook(user, book);
        if (existingUserBook.isPresent()) {
            throw new RuntimeException("Book already exists in your library");
        }
        
        UserBook userBook = new UserBook(user, book, request.getStatus());
        userBook.setRating(request.getRating());
        userBook.setReview(request.getReview());
        userBook.setReadDate(request.getReadDate());
        userBook.setIsFavourite(request.getIsFavourite() != null ? request.getIsFavourite() : false);
        
        // Set read date automatically if status is 'read' and no date provided
        if (request.getStatus() == UserBook.ReadingStatus.read && request.getReadDate() == null) {
            userBook.setReadDate(LocalDate.now());
        }
        
        UserBook savedUserBook = userBookRepository.save(userBook);
        return new UserBookResponse(savedUserBook);
    }
    
    /**
     * Update book in user's library
     */
    public UserBookResponse updateBookInLibrary(Long userId, Long userBookId, UserBookRequest request) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new RuntimeException("Book not found in library"));
        
        // Verify the book belongs to the user
        if (!userBook.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to library item");
        }
        
        userBook.setStatus(request.getStatus());
        userBook.setRating(request.getRating());
        userBook.setReview(request.getReview());
        userBook.setReadDate(request.getReadDate());
        userBook.setIsFavourite(request.getIsFavourite() != null ? request.getIsFavourite() : userBook.getIsFavourite());
        
        // Set read date automatically if status changed to 'read' and no date provided
        if (request.getStatus() == UserBook.ReadingStatus.read && request.getReadDate() == null && userBook.getReadDate() == null) {
            userBook.setReadDate(LocalDate.now());
        }
        
        UserBook savedUserBook = userBookRepository.save(userBook);
        return new UserBookResponse(savedUserBook);
    }
    
    /**
     * Remove book from user's library
     */
    public void removeBookFromLibrary(Long userId, Long userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new RuntimeException("Book not found in library"));
        
        // Verify the book belongs to the user
        if (!userBook.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to library item");
        }
        
        userBookRepository.delete(userBook);
    }
    
    /**
     * Get user's library with pagination
     */
    @Transactional(readOnly = true)
    public Page<UserBookResponse> getUserLibrary(Long userId, int page, int size, String sortBy, String sortDir) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserBook> userBooks = userBookRepository.findByUser(user, pageable);
        
        return userBooks.map(UserBookResponse::new);
    }
    
    /**
     * Get user's library by status
     */
    @Transactional(readOnly = true)
    public Page<UserBookResponse> getUserLibraryByStatus(Long userId, UserBook.ReadingStatus status, 
                                                        int page, int size, String sortBy, String sortDir) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserBook> userBooks = userBookRepository.findByUserAndStatus(user, status, pageable);
        
        return userBooks.map(UserBookResponse::new);
    }
    
    /**
     * Get user's favorite books
     */
    @Transactional(readOnly = true)
    public Page<UserBookResponse> getUserFavoriteBooks(Long userId, int page, int size, String sortBy, String sortDir) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserBook> userBooks = userBookRepository.findByUserAndIsFavouriteTrue(user, pageable);
        
        return userBooks.map(UserBookResponse::new);
    }
    
    /**
     * Toggle favorite status of a book
     */
    public UserBookResponse toggleFavorite(Long userId, Long userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new RuntimeException("Book not found in library"));
        
        // Verify the book belongs to the user
        if (!userBook.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to library item");
        }
        
        userBook.setIsFavourite(!userBook.getIsFavourite());
        UserBook savedUserBook = userBookRepository.save(userBook);
        return new UserBookResponse(savedUserBook);
    }
    
    /**
     * Get library statistics for a user
     */
    @Transactional(readOnly = true)
    public LibraryStatsResponse getLibraryStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long totalBooks = userBookRepository.countByUser(user);
        long booksRead = userBookRepository.countByUserAndStatus(user, UserBook.ReadingStatus.read);
        long booksToRead = userBookRepository.countByUserAndStatus(user, UserBook.ReadingStatus.to_read);
        long favoriteBooks = userBookRepository.countByUserAndIsFavouriteTrue(user);
        
        // Get rating distribution
        List<Object[]> ratingData = userBookRepository.getUserRatingDistribution(user);
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        double totalRatingSum = 0;
        long totalRatedBooks = 0;
        
        for (Object[] data : ratingData) {
            Integer rating = (Integer) data[0];
            Long count = (Long) data[1];
            ratingDistribution.put(rating, count);
            totalRatingSum += rating * count;
            totalRatedBooks += count;
        }
        
        double averageRating = totalRatedBooks > 0 ? totalRatingSum / totalRatedBooks : 0.0;
        
        return new LibraryStatsResponse(totalBooks, booksRead, booksToRead, favoriteBooks, 
                                       ratingDistribution, averageRating);
    }
    
    /**
     * Get a specific book from user's library
     */
    @Transactional(readOnly = true)
    public UserBookResponse getUserBook(Long userId, Long userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new RuntimeException("Book not found in library"));
        
        // Verify the book belongs to the user
        if (!userBook.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to library item");
        }
        
        return new UserBookResponse(userBook);
    }
    
    /**
     * Check if user has a book in their library
     */
    @Transactional(readOnly = true)
    public boolean hasBookInLibrary(Long userId, Long bookId) {
        return userBookRepository.existsByUserIdAndBookId(userId, bookId);
    }
    
    /**
     * Get recent library activity
     */
    @Transactional(readOnly = true)
    public List<UserBookResponse> getRecentActivity(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Pageable pageable = PageRequest.of(0, limit);
        List<UserBook> recentBooks = userBookRepository.findRecentActivity(user, pageable);
        
        return recentBooks.stream()
                .map(UserBookResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user book by book ID
     */
    @Transactional(readOnly = true)
    public UserBookResponse getUserBookByBookId(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));
        
        Optional<UserBook> userBook = userBookRepository.findByUserAndBook(user, book);
        return userBook.map(UserBookResponse::new).orElse(null);
    }
    
    /**
     * Helper method to get user ID by username
     */
    @Transactional(readOnly = true)
    public Long getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}