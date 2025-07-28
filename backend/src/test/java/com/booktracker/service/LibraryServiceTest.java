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

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LibraryServiceTest {

    @Mock
    private UserBookRepository userBookRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private LibraryService libraryService;

    private User testUser;
    private Book testBook;
    private UserBook testUserBook;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");

        testBook = new Book();
        testBook.setId(1L);
        testBook.setTitle("Test Book");
        testBook.setAuthor("Test Author");

        testUserBook = new UserBook();
        testUserBook.setId(1L);
        testUserBook.setUser(testUser);
        testUserBook.setBook(testBook);
        testUserBook.setStatus(UserBook.ReadingStatus.to_read);
        testUserBook.setIsFavourite(false);
    }

    @Test
    void addBookToLibrary_Success() {
        // Arrange
        UserBookRequest request = new UserBookRequest();
        request.setBookId(1L);
        request.setStatus(UserBook.ReadingStatus.to_read);
        request.setIsFavourite(false);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(userBookRepository.findByUserAndBook(testUser, testBook)).thenReturn(Optional.empty());
        when(userBookRepository.save(any(UserBook.class))).thenReturn(testUserBook);

        // Act
        UserBookResponse response = libraryService.addBookToLibrary(1L, request);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(UserBook.ReadingStatus.to_read, response.getStatus());
        verify(userBookRepository).save(any(UserBook.class));
    }

    @Test
    void addBookToLibrary_BookAlreadyExists() {
        // Arrange
        UserBookRequest request = new UserBookRequest();
        request.setBookId(1L);
        request.setStatus(UserBook.ReadingStatus.to_read);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(userBookRepository.findByUserAndBook(testUser, testBook)).thenReturn(Optional.of(testUserBook));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> libraryService.addBookToLibrary(1L, request));
        assertEquals("Book already exists in your library", exception.getMessage());
    }

    @Test
    void updateBookInLibrary_Success() {
        // Arrange
        UserBookRequest request = new UserBookRequest();
        request.setStatus(UserBook.ReadingStatus.read);
        request.setRating(5);
        request.setReview("Great book!");
        request.setReadDate(LocalDate.now());
        request.setIsFavourite(true);

        when(userBookRepository.findById(1L)).thenReturn(Optional.of(testUserBook));
        when(userBookRepository.save(any(UserBook.class))).thenReturn(testUserBook);

        // Act
        UserBookResponse response = libraryService.updateBookInLibrary(1L, 1L, request);

        // Assert
        assertNotNull(response);
        verify(userBookRepository).save(testUserBook);
        assertEquals(UserBook.ReadingStatus.read, testUserBook.getStatus());
        assertEquals(5, testUserBook.getRating());
        assertEquals("Great book!", testUserBook.getReview());
        assertTrue(testUserBook.getIsFavourite());
    }

    @Test
    void updateBookInLibrary_UnauthorizedAccess() {
        // Arrange
        UserBookRequest request = new UserBookRequest();
        request.setStatus(UserBook.ReadingStatus.read);

        User differentUser = new User();
        differentUser.setId(2L);
        testUserBook.setUser(differentUser);

        when(userBookRepository.findById(1L)).thenReturn(Optional.of(testUserBook));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> libraryService.updateBookInLibrary(1L, 1L, request));
        assertEquals("Unauthorized access to library item", exception.getMessage());
    }

    @Test
    void removeBookFromLibrary_Success() {
        // Arrange
        when(userBookRepository.findById(1L)).thenReturn(Optional.of(testUserBook));

        // Act
        libraryService.removeBookFromLibrary(1L, 1L);

        // Assert
        verify(userBookRepository).delete(testUserBook);
    }

    @Test
    void getUserLibrary_Success() {
        // Arrange
        List<UserBook> userBooks = Arrays.asList(testUserBook);
        Page<UserBook> page = new PageImpl<>(userBooks);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userBookRepository.findByUser(eq(testUser), any(Pageable.class))).thenReturn(page);

        // Act
        Page<UserBookResponse> result = libraryService.getUserLibrary(1L, 0, 10, "id", "desc");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(1L, result.getContent().get(0).getId());
    }

    @Test
    void getUserLibraryByStatus_Success() {
        // Arrange
        List<UserBook> userBooks = Arrays.asList(testUserBook);
        Page<UserBook> page = new PageImpl<>(userBooks);

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userBookRepository.findByUserAndStatus(eq(testUser), eq(UserBook.ReadingStatus.to_read), any(Pageable.class)))
            .thenReturn(page);

        // Act
        Page<UserBookResponse> result = libraryService.getUserLibraryByStatus(1L, UserBook.ReadingStatus.to_read, 0, 10, "id", "desc");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(UserBook.ReadingStatus.to_read, result.getContent().get(0).getStatus());
    }

    @Test
    void toggleFavorite_Success() {
        // Arrange
        testUserBook.setIsFavourite(false);
        when(userBookRepository.findById(1L)).thenReturn(Optional.of(testUserBook));
        when(userBookRepository.save(any(UserBook.class))).thenReturn(testUserBook);

        // Act
        UserBookResponse response = libraryService.toggleFavorite(1L, 1L);

        // Assert
        assertNotNull(response);
        assertTrue(testUserBook.getIsFavourite());
        verify(userBookRepository).save(testUserBook);
    }

    @Test
    void getLibraryStats_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userBookRepository.countByUser(testUser)).thenReturn(10L);
        when(userBookRepository.countByUserAndStatus(testUser, UserBook.ReadingStatus.read)).thenReturn(6L);
        when(userBookRepository.countByUserAndStatus(testUser, UserBook.ReadingStatus.to_read)).thenReturn(4L);
        when(userBookRepository.countByUserAndIsFavouriteTrue(testUser)).thenReturn(3L);

        List<Object[]> ratingData = Arrays.asList(
            new Object[]{5, 3L},
            new Object[]{4, 2L},
            new Object[]{3, 1L}
        );
        when(userBookRepository.getUserRatingDistribution(testUser)).thenReturn(ratingData);

        // Act
        LibraryStatsResponse stats = libraryService.getLibraryStats(1L);

        // Assert
        assertNotNull(stats);
        assertEquals(10L, stats.getTotalBooks());
        assertEquals(6L, stats.getBooksRead());
        assertEquals(4L, stats.getBooksToRead());
        assertEquals(3L, stats.getFavoriteBooks());
        assertEquals(4.33, stats.getAverageRating(), 0.01); // (5*3 + 4*2 + 3*1) / 6 = 26/6 = 4.33
        assertEquals(3, stats.getRatingDistribution().size());
    }

    @Test
    void hasBookInLibrary_Success() {
        // Arrange
        when(userBookRepository.existsByUserIdAndBookId(1L, 1L)).thenReturn(true);

        // Act
        boolean result = libraryService.hasBookInLibrary(1L, 1L);

        // Assert
        assertTrue(result);
    }

    @Test
    void getUserIdByUsername_Success() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act
        Long userId = libraryService.getUserIdByUsername("testuser");

        // Assert
        assertEquals(1L, userId);
    }

    @Test
    void getUserIdByUsername_UserNotFound() {
        // Arrange
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> libraryService.getUserIdByUsername("nonexistent"));
        assertEquals("User not found", exception.getMessage());
    }
}