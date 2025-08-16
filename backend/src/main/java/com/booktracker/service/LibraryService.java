package com.booktracker.service;

import com.booktracker.dto.LibraryStatsResponse;
import com.booktracker.dto.UserBookRequest;
import com.booktracker.dto.UserBookResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.User;
import com.booktracker.entity.UserBook;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.FriendshipRepository;
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
    
    private final UserBookRepository userBookRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    
    public LibraryService(UserBookRepository userBookRepository, 
                         BookRepository bookRepository,
                         UserRepository userRepository, 
                         FriendshipRepository friendshipRepository) {
        this.userBookRepository = userBookRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
    }
    
    /**
     * Add a book to user's library
     */
    public UserBookResponse addBookToLibrary(Long userId, UserBookRequest request) {
        User user = validateAndFetchUser(userId);
        
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
        
        // Get average rating for this book
        Double bookRating = userBookRepository.getAverageRatingForBook(book.getId());
        
        return new UserBookResponse(savedUserBook, bookRating);
    }
    
    /**
     * Update book in user's library
     */
    public UserBookResponse updateBookInLibrary(Long userId, Long userBookId, UserBookRequest request) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new RuntimeException("Book not found in library"));
        
        // Verify the book belongs to the user
        validateUserBookOwnership(userBook, userId);
        
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
        
        // Get average rating for this book
        Double bookRating = userBookRepository.getAverageRatingForBook(userBook.getBook().getId());
        
        return new UserBookResponse(savedUserBook, bookRating);
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
     * Helper method to validate and fetch user by ID
     * @param userId The user ID to validate and fetch
     * @return User entity if found
     * @throws RuntimeException if user not found
     */
    private User validateAndFetchUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /**
     * Helper method to validate user ownership of a UserBook
     * @param userBook The UserBook to validate ownership for
     * @param userId The user ID that should own the book
     * @throws RuntimeException if user doesn't own the book
     */
    private void validateUserBookOwnership(UserBook userBook, Long userId) {
        if (!userBook.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to library item");
        }
    }

    /**
     * Helper method to efficiently fetch average ratings for multiple books
     * @param userBooks List of UserBook entities to fetch ratings for
     * @return Map of book ID to average rating
     */
    private Map<Long, Double> fetchBookRatings(List<UserBook> userBooks) {
        List<Long> bookIds = userBooks.stream()
                .map(ub -> ub.getBook().getId())
                .collect(Collectors.toList());
        
        Map<Long, Double> bookRatings = new HashMap<>();
        if (!bookIds.isEmpty()) {
            List<Object[]> ratings = userBookRepository.getAverageRatingsForBooks(bookIds);
            for (Object[] rating : ratings) {
                Long bookId = (Long) rating[0];
                Double avgRating = (Double) rating[1];
                bookRatings.put(bookId, avgRating);
            }
        }
        return bookRatings;
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
        
        Map<Long, Double> bookRatings = fetchBookRatings(userBooks.getContent());
        
        return userBooks.map(userBook -> {
            Double bookRating = bookRatings.get(userBook.getBook().getId());
            return new UserBookResponse(userBook, bookRating);
        });
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
        
        Map<Long, Double> bookRatings = fetchBookRatings(userBooks.getContent());
        
        return userBooks.map(userBook -> {
            Double bookRating = bookRatings.get(userBook.getBook().getId());
            return new UserBookResponse(userBook, bookRating);
        });
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
        
        Map<Long, Double> bookRatings = fetchBookRatings(userBooks.getContent());
        
        return userBooks.map(userBook -> {
            Double bookRating = bookRatings.get(userBook.getBook().getId());
            return new UserBookResponse(userBook, bookRating);
        });
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
        
        // Get average rating for this book
        Double bookRating = userBookRepository.getAverageRatingForBook(userBook.getBook().getId());
        
        return new UserBookResponse(savedUserBook, bookRating);
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
        long booksCurrentlyReading = userBookRepository.countByUserAndStatus(user, UserBook.ReadingStatus.currently_reading);
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
        
        return new LibraryStatsResponse(totalBooks, booksRead, booksCurrentlyReading, booksToRead, favoriteBooks, 
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
        
        // Get average rating for this book
        Double bookRating = userBookRepository.getAverageRatingForBook(userBook.getBook().getId());
        
        return new UserBookResponse(userBook, bookRating);
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
        
        Map<Long, Double> bookRatings = fetchBookRatings(recentBooks);
        
        return recentBooks.stream()
                .map(userBook -> {
                    Double bookRating = bookRatings.get(userBook.getBook().getId());
                    return new UserBookResponse(userBook, bookRating);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get reviews for a book (latest first)
     */
    @Transactional(readOnly = true)
    public Page<UserBookResponse> getBookReviews(Long bookId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<UserBook> pageResult = userBookRepository.findRecentReviewsForBook(bookId, pageable);
        return pageResult.map(userBook -> {
            Double bookRating = userBookRepository.getAverageRatingForBook(userBook.getBook().getId());
            return new UserBookResponse(userBook, bookRating);
        });
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
        if (userBook.isPresent()) {
            // Get average rating for this book
            Double bookRating = userBookRepository.getAverageRatingForBook(bookId);
            return new UserBookResponse(userBook.get(), bookRating);
        }
        return null;
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
    
    /**
     * Check if two users are friends
     */
    @Transactional(readOnly = true)
    public boolean areUsersFriends(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return friendshipRepository.areFriends(user1, user2);
    }
}