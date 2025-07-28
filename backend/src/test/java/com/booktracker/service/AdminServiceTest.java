package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.*;
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
class AdminServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserBookRepository userBookRepository;

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private RecommendationRepository recommendationRepository;

    @InjectMocks
    private AdminService adminService;

    private Book testBook;
    private Genre testGenre;
    private AdminBookRequest bookRequest;
    private AdminGenreRequest genreRequest;

    @BeforeEach
    void setUp() {
        testGenre = new Genre("Fiction");
        testGenre.setId(1L);

        testBook = new Book("Test Book", "Test Author");
        testBook.setId(1L);
        testBook.setPublishedYear(2023);
        testBook.setDescription("Test Description");
        testBook.getGenres().add(testGenre);

        bookRequest = new AdminBookRequest();
        bookRequest.setTitle("Test Book");
        bookRequest.setAuthor("Test Author");
        bookRequest.setPublishedYear(2023);
        bookRequest.setDescription("Test Description");
        bookRequest.setGenreIds(Set.of(1L));

        genreRequest = new AdminGenreRequest();
        genreRequest.setName("Fiction");
    }

    @Test
    void createBook_Success() {
        // Arrange
        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);

        // Act
        BookResponse result = adminService.createBook(bookRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Test Book", result.getTitle());
        assertEquals("Test Author", result.getAuthor());
        assertEquals(2023, result.getPublishedYear());
        assertEquals("Test Description", result.getDescription());
        assertNotNull(result.getGenres());
        assertEquals(1, result.getGenres().size());
        assertEquals("Fiction", result.getGenres().iterator().next().getName());

        verify(bookRepository).save(any(Book.class));
        verify(genreRepository).findById(1L);
    }

    @Test
    void createBook_GenreNotFound() {
        // Arrange
        when(genreRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> adminService.createBook(bookRequest));
        verify(genreRepository).findById(1L);
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    void updateBook_Success() {
        // Arrange
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));
        when(bookRepository.save(any(Book.class))).thenReturn(testBook);

        bookRequest.setTitle("Updated Book");

        // Act
        BookResponse result = adminService.updateBook(1L, bookRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Book", result.getTitle());
        verify(bookRepository).findById(1L);
        verify(bookRepository).save(any(Book.class));
    }

    @Test
    void updateBook_BookNotFound() {
        // Arrange
        when(bookRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> adminService.updateBook(1L, bookRequest));
        verify(bookRepository).findById(1L);
        verify(bookRepository, never()).save(any(Book.class));
    }

    @Test
    void deleteBook_Success() {
        // Arrange
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));

        // Act
        adminService.deleteBook(1L);

        // Assert
        verify(bookRepository).findById(1L);
        verify(bookRepository).delete(testBook);
    }

    @Test
    void deleteBook_BookNotFound() {
        // Arrange
        when(bookRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> adminService.deleteBook(1L));
        verify(bookRepository).findById(1L);
        verify(bookRepository, never()).delete(any(Book.class));
    }

    @Test
    void getAllBooks_Success() {
        // Arrange
        List<Book> books = Arrays.asList(testBook);
        Page<Book> bookPage = new PageImpl<>(books);
        Pageable pageable = PageRequest.of(0, 10);
        
        when(bookRepository.findAll(pageable)).thenReturn(bookPage);

        // Act
        Page<BookResponse> result = adminService.getAllBooks(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Book", result.getContent().get(0).getTitle());
        verify(bookRepository).findAll(pageable);
    }

    @Test
    void createGenre_Success() {
        // Arrange
        when(genreRepository.existsByNameIgnoreCase("Fiction")).thenReturn(false);
        when(genreRepository.save(any(Genre.class))).thenReturn(testGenre);

        // Act
        GenreResponse result = adminService.createGenre(genreRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Fiction", result.getName());
        verify(genreRepository).existsByNameIgnoreCase("Fiction");
        verify(genreRepository).save(any(Genre.class));
    }

    @Test
    void createGenre_AlreadyExists() {
        // Arrange
        when(genreRepository.existsByNameIgnoreCase("Fiction")).thenReturn(true);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> adminService.createGenre(genreRequest));
        verify(genreRepository).existsByNameIgnoreCase("Fiction");
        verify(genreRepository, never()).save(any(Genre.class));
    }

    @Test
    void updateGenre_Success() {
        // Arrange
        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));
        when(genreRepository.findByNameIgnoreCase("Updated Fiction")).thenReturn(Optional.empty());
        when(genreRepository.save(any(Genre.class))).thenReturn(testGenre);

        genreRequest.setName("Updated Fiction");

        // Act
        GenreResponse result = adminService.updateGenre(1L, genreRequest);

        // Assert
        assertNotNull(result);
        verify(genreRepository).findById(1L);
        verify(genreRepository).save(any(Genre.class));
    }

    @Test
    void deleteGenre_Success() {
        // Arrange
        Genre emptyGenre = new Genre("Empty Genre");
        emptyGenre.setId(2L);
        when(genreRepository.findById(2L)).thenReturn(Optional.of(emptyGenre));

        // Act
        adminService.deleteGenre(2L);

        // Assert
        verify(genreRepository).findById(2L);
        verify(genreRepository).delete(emptyGenre);
    }

    @Test
    void deleteGenre_HasBooks() {
        // Arrange
        Genre genreWithBooks = new Genre("Fiction");
        genreWithBooks.setId(1L);
        genreWithBooks.getBooks().add(testBook); // Add a book to make it non-empty
        
        when(genreRepository.findById(1L)).thenReturn(Optional.of(genreWithBooks));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> adminService.deleteGenre(1L));
        verify(genreRepository).findById(1L);
        verify(genreRepository, never()).delete(any(Genre.class));
    }

    @Test
    void getBooksByCategoryData_Success() {
        // Arrange
        List<Object[]> mockResults = new ArrayList<>();
        mockResults.add(new Object[]{"Fiction", 10L});
        mockResults.add(new Object[]{"Non-Fiction", 5L});
        when(genreRepository.countBooksByGenre()).thenReturn(mockResults);
        when(bookRepository.count()).thenReturn(15L);

        // Act
        List<BooksByCategoryReportData> result = adminService.getBooksByCategoryData();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        
        BooksByCategoryReportData fictionResult = result.get(0);
        assertEquals("Fiction", fictionResult.getCategoryName());
        assertEquals(10L, fictionResult.getBookCount());
        assertEquals(66.67, fictionResult.getPercentage(), 0.01);

        BooksByCategoryReportData nonFictionResult = result.get(1);
        assertEquals("Non-Fiction", nonFictionResult.getCategoryName());
        assertEquals(5L, nonFictionResult.getBookCount());
        assertEquals(33.33, nonFictionResult.getPercentage(), 0.01);

        verify(genreRepository).countBooksByGenre();
        verify(bookRepository).count();
    }

    @Test
    void getDailyActivityData_Success() {
        // Arrange
        LocalDate startDate = LocalDate.of(2023, 1, 1);
        LocalDate endDate = LocalDate.of(2023, 1, 2);

        when(userRepository.countUsersRegisteredOnDate(any(LocalDate.class))).thenReturn(5L);
        when(userBookRepository.countBooksAddedOnDate(any(LocalDate.class))).thenReturn(10L);
        when(userBookRepository.countReviewsPostedOnDate(any(LocalDate.class))).thenReturn(3L);
        when(friendshipRepository.countFriendRequestsSentOnDate(any(LocalDate.class))).thenReturn(2L);
        when(recommendationRepository.countRecommendationsSentOnDate(any(LocalDate.class))).thenReturn(1L);

        // Act
        List<DailyActivityReportData> result = adminService.getDailyActivityData(startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());

        DailyActivityReportData day1 = result.get(0);
        assertEquals(startDate, day1.getDate());
        assertEquals(5L, day1.getUserRegistrations());
        assertEquals(10L, day1.getBooksAdded());
        assertEquals(3L, day1.getReviewsPosted());
        assertEquals(2L, day1.getFriendRequestsSent());
        assertEquals(1L, day1.getRecommendationsSent());

        verify(userRepository, times(2)).countUsersRegisteredOnDate(any(LocalDate.class));
        verify(userBookRepository, times(2)).countBooksAddedOnDate(any(LocalDate.class));
        verify(userBookRepository, times(2)).countReviewsPostedOnDate(any(LocalDate.class));
        verify(friendshipRepository, times(2)).countFriendRequestsSentOnDate(any(LocalDate.class));
        verify(recommendationRepository, times(2)).countRecommendationsSentOnDate(any(LocalDate.class));
    }

    @Test
    void getUserEngagementData_Success() {
        // Arrange
        List<Object[]> mockResults = new ArrayList<>();
        mockResults.add(new Object[]{"user1", "user1@example.com", 10L, 8L, 2L, 5L, 3L, 4.5, 6L});
        when(userRepository.getUserEngagementData()).thenReturn(mockResults);

        // Act
        List<UserEngagementReportData> result = adminService.getUserEngagementData();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());

        UserEngagementReportData userResult = result.get(0);
        assertEquals("user1", userResult.getUsername());
        assertEquals("user1@example.com", userResult.getEmail());
        assertEquals(10L, userResult.getTotalBooks());
        assertEquals(8L, userResult.getBooksRead());
        assertEquals(2L, userResult.getBooksToRead());
        assertEquals(5L, userResult.getFriendsCount());
        assertEquals(3L, userResult.getRecommendationsSent());
        assertEquals(4.5, userResult.getAverageRating());
        assertEquals(6L, userResult.getReviewsWritten());

        verify(userRepository).getUserEngagementData();
    }
}