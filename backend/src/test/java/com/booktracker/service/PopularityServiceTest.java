package com.booktracker.service;

import com.booktracker.dto.BookResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.BookView;
import com.booktracker.entity.Genre;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.BookViewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PopularityServiceTest {

    @Mock
    private BookViewRepository bookViewRepository;

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private PopularityService popularityService;

    private Book testBook1;
    private Book testBook2;
    private Book testBook3;
    private BookView bookView1;
    private BookView bookView2;
    private BookView bookView3;
    private Genre testGenre;

    @BeforeEach
    void setUp() {
        testGenre = new Genre("Fiction");
        testGenre.setId(1L);

        // Create test books
        testBook1 = new Book("Popular Book", "Author 1");
        testBook1.setId(1L);
        testBook1.setPublishedYear(2023);
        testBook1.setDescription("Most popular book");
        testBook1.setGenres(Set.of(testGenre));

        testBook2 = new Book("Moderate Book", "Author 2");
        testBook2.setId(2L);
        testBook2.setPublishedYear(2022);
        testBook2.setDescription("Moderately popular book");
        testBook2.setGenres(Set.of(testGenre));

        testBook3 = new Book("Less Popular Book", "Author 3");
        testBook3.setId(3L);
        testBook3.setPublishedYear(2021);
        testBook3.setDescription("Less popular book");
        testBook3.setGenres(Set.of(testGenre));

        // Create test book views
        bookView1 = new BookView(testBook1, 100L);
        bookView1.setId(1L);

        bookView2 = new BookView(testBook2, 50L);
        bookView2.setId(2L);

        bookView3 = new BookView(testBook3, 10L);
        bookView3.setId(3L);
    }

    @Test
    void recordBookView_ShouldIncrementExistingViewCount() {
        // Given
        Long bookId = 1L;
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(testBook1));
        when(bookViewRepository.findByBookId(bookId)).thenReturn(Optional.of(bookView1));
        when(bookViewRepository.save(any(BookView.class))).thenReturn(bookView1);

        // When
        popularityService.recordBookView(bookId);

        // Then
        verify(bookRepository).findById(bookId);
        verify(bookViewRepository).findByBookId(bookId);
        verify(bookViewRepository).save(bookView1);
        assertEquals(101L, bookView1.getViewCount()); // Should be incremented
    }

    @Test
    void recordBookView_ShouldCreateNewBookViewForFirstView() {
        // Given
        Long bookId = 1L;
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(testBook1));
        when(bookViewRepository.findByBookId(bookId)).thenReturn(Optional.empty());
        when(bookViewRepository.save(any(BookView.class))).thenReturn(new BookView(testBook1, 1L));

        // When
        popularityService.recordBookView(bookId);

        // Then
        verify(bookRepository).findById(bookId);
        verify(bookViewRepository).findByBookId(bookId);
        verify(bookViewRepository).save(argThat(bookView -> 
            bookView.getBook().equals(testBook1) && bookView.getViewCount().equals(1L)
        ));
    }

    @Test
    void recordBookView_ShouldThrowException_WhenBookNotFound() {
        // Given
        Long bookId = 999L;
        when(bookRepository.findById(bookId)).thenReturn(Optional.empty());

        // When & Then
        ResourceNotFoundException exception = assertThrows(
            ResourceNotFoundException.class,
            () -> popularityService.recordBookView(bookId)
        );

        assertEquals("Book not found with ID: 999", exception.getMessage());
        verify(bookRepository).findById(bookId);
        verify(bookViewRepository, never()).findByBookId(any());
        verify(bookViewRepository, never()).save(any());
    }

    @Test
    void recordBookView_ShouldHandleRepositoryException_Gracefully() {
        // Given
        Long bookId = 1L;
        when(bookRepository.findById(bookId)).thenReturn(Optional.of(testBook1));
        when(bookViewRepository.findByBookId(bookId)).thenThrow(new RuntimeException("Database error"));

        // When & Then - Should not throw exception
        assertDoesNotThrow(() -> popularityService.recordBookView(bookId));

        verify(bookRepository).findById(bookId);
        verify(bookViewRepository).findByBookId(bookId);
        verify(bookViewRepository, never()).save(any());
    }

    @Test
    void getMostPopularBooks_ShouldReturnTop10Books_WhenLimitIs10OrLess() {
        // Given
        int limit = 5;
        List<BookView> topBookViews = Arrays.asList(bookView1, bookView2, bookView3);
        when(bookViewRepository.findTop10ByOrderByViewCountDesc()).thenReturn(topBookViews);

        // When
        List<BookResponse> result = popularityService.getMostPopularBooks(limit);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("Popular Book", result.get(0).getTitle());
        assertEquals(100L, result.get(0).getViewCount());
        assertEquals("Moderate Book", result.get(1).getTitle());
        assertEquals(50L, result.get(1).getViewCount());
        assertEquals("Less Popular Book", result.get(2).getTitle());
        assertEquals(10L, result.get(2).getViewCount());

        verify(bookViewRepository).findTop10ByOrderByViewCountDesc();
        verify(bookViewRepository, never()).findAllByOrderByViewCountDesc();
    }

    @Test
    void getMostPopularBooks_ShouldLimitResults_WhenRequestedLimitIsSmaller() {
        // Given
        int limit = 2;
        List<BookView> topBookViews = Arrays.asList(bookView1, bookView2, bookView3);
        when(bookViewRepository.findTop10ByOrderByViewCountDesc()).thenReturn(topBookViews);

        // When
        List<BookResponse> result = popularityService.getMostPopularBooks(limit);

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Popular Book", result.get(0).getTitle());
        assertEquals("Moderate Book", result.get(1).getTitle());

        verify(bookViewRepository).findTop10ByOrderByViewCountDesc();
    }

    @Test
    void getMostPopularBooks_ShouldUseAllQuery_WhenLimitIsGreaterThan10() {
        // Given
        int limit = 15;
        List<BookView> allBookViews = Arrays.asList(bookView1, bookView2, bookView3);
        when(bookViewRepository.findAllByOrderByViewCountDesc()).thenReturn(allBookViews);

        // When
        List<BookResponse> result = popularityService.getMostPopularBooks(limit);

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("Popular Book", result.get(0).getTitle());
        assertEquals(100L, result.get(0).getViewCount());

        verify(bookViewRepository, never()).findTop10ByOrderByViewCountDesc();
        verify(bookViewRepository).findAllByOrderByViewCountDesc();
    }

    @Test
    void getMostPopularBooks_ShouldReturnEmptyList_WhenRepositoryThrowsException() {
        // Given
        int limit = 5;
        when(bookViewRepository.findTop10ByOrderByViewCountDesc()).thenThrow(new RuntimeException("Database error"));

        // When
        List<BookResponse> result = popularityService.getMostPopularBooks(limit);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(bookViewRepository).findTop10ByOrderByViewCountDesc();
    }

    @Test
    void getMostPopularBooks_ShouldReturnEmptyList_WhenNoViews() {
        // Given
        int limit = 5;
        when(bookViewRepository.findTop10ByOrderByViewCountDesc()).thenReturn(Collections.emptyList());

        // When
        List<BookResponse> result = popularityService.getMostPopularBooks(limit);

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(bookViewRepository).findTop10ByOrderByViewCountDesc();
    }

    @Test
    void getPopularityStatistics_ShouldReturnAllBooksWithViewCounts() {
        // Given
        List<BookView> allBookViews = Arrays.asList(bookView1, bookView2, bookView3);
        when(bookViewRepository.findAllByOrderByViewCountDesc()).thenReturn(allBookViews);

        // When
        List<BookResponse> result = popularityService.getPopularityStatistics();

        // Then
        assertNotNull(result);
        assertEquals(3, result.size());
        assertEquals("Popular Book", result.get(0).getTitle());
        assertEquals(100L, result.get(0).getViewCount());
        assertEquals("Moderate Book", result.get(1).getTitle());
        assertEquals(50L, result.get(1).getViewCount());
        assertEquals("Less Popular Book", result.get(2).getTitle());
        assertEquals(10L, result.get(2).getViewCount());

        verify(bookViewRepository).findAllByOrderByViewCountDesc();
    }

    @Test
    void getPopularityStatistics_ShouldReturnEmptyList_WhenRepositoryThrowsException() {
        // Given
        when(bookViewRepository.findAllByOrderByViewCountDesc()).thenThrow(new RuntimeException("Database error"));

        // When
        List<BookResponse> result = popularityService.getPopularityStatistics();

        // Then
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(bookViewRepository).findAllByOrderByViewCountDesc();
    }

    @Test
    void getBookViewCount_ShouldReturnViewCount_WhenBookHasViews() {
        // Given
        Long bookId = 1L;
        when(bookViewRepository.findByBookId(bookId)).thenReturn(Optional.of(bookView1));

        // When
        Long result = popularityService.getBookViewCount(bookId);

        // Then
        assertEquals(100L, result);
        verify(bookViewRepository).findByBookId(bookId);
    }

    @Test
    void getBookViewCount_ShouldReturnZero_WhenBookHasNoViews() {
        // Given
        Long bookId = 1L;
        when(bookViewRepository.findByBookId(bookId)).thenReturn(Optional.empty());

        // When
        Long result = popularityService.getBookViewCount(bookId);

        // Then
        assertEquals(0L, result);
        verify(bookViewRepository).findByBookId(bookId);
    }

    @Test
    void getBookViewCount_ShouldReturnZero_WhenRepositoryThrowsException() {
        // Given
        Long bookId = 1L;
        when(bookViewRepository.findByBookId(bookId)).thenThrow(new RuntimeException("Database error"));

        // When
        Long result = popularityService.getBookViewCount(bookId);

        // Then
        assertEquals(0L, result);
        verify(bookViewRepository).findByBookId(bookId);
    }

    @Test
    void getTotalViewCount_ShouldReturnTotalViews() {
        // Given
        Long expectedTotal = 160L; // 100 + 50 + 10
        when(bookViewRepository.getTotalViewCount()).thenReturn(expectedTotal);

        // When
        Long result = popularityService.getTotalViewCount();

        // Then
        assertEquals(expectedTotal, result);
        verify(bookViewRepository).getTotalViewCount();
    }

    @Test
    void getTotalViewCount_ShouldReturnZero_WhenRepositoryThrowsException() {
        // Given
        when(bookViewRepository.getTotalViewCount()).thenThrow(new RuntimeException("Database error"));

        // When
        Long result = popularityService.getTotalViewCount();

        // Then
        assertEquals(0L, result);
        verify(bookViewRepository).getTotalViewCount();
    }

    @Test
    void hasBookViews_ShouldReturnTrue_WhenBookHasViews() {
        // Given
        Long bookId = 1L;
        when(bookViewRepository.existsByBookId(bookId)).thenReturn(true);

        // When
        boolean result = popularityService.hasBookViews(bookId);

        // Then
        assertTrue(result);
        verify(bookViewRepository).existsByBookId(bookId);
    }

    @Test
    void hasBookViews_ShouldReturnFalse_WhenBookHasNoViews() {
        // Given
        Long bookId = 1L;
        when(bookViewRepository.existsByBookId(bookId)).thenReturn(false);

        // When
        boolean result = popularityService.hasBookViews(bookId);

        // Then
        assertFalse(result);
        verify(bookViewRepository).existsByBookId(bookId);
    }

    @Test
    void hasBookViews_ShouldReturnFalse_WhenRepositoryThrowsException() {
        // Given
        Long bookId = 1L;
        when(bookViewRepository.existsByBookId(bookId)).thenThrow(new RuntimeException("Database error"));

        // When
        boolean result = popularityService.hasBookViews(bookId);

        // Then
        assertFalse(result);
        verify(bookViewRepository).existsByBookId(bookId);
    }

    @Test
    void recordBookView_ShouldHandleConcurrentAccess() {
        // Given
        Long bookId = 1L;
        BookView concurrentBookView = new BookView(testBook1, 100L);
        concurrentBookView.setId(1L);

        when(bookRepository.findById(bookId)).thenReturn(Optional.of(testBook1));
        when(bookViewRepository.findByBookId(bookId)).thenReturn(Optional.of(concurrentBookView));
        when(bookViewRepository.save(any(BookView.class))).thenReturn(concurrentBookView);

        // When
        popularityService.recordBookView(bookId);

        // Then
        verify(bookRepository).findById(bookId);
        verify(bookViewRepository).findByBookId(bookId);
        verify(bookViewRepository).save(concurrentBookView);
        assertEquals(101L, concurrentBookView.getViewCount());
    }

    @Test
    void getMostPopularBooks_ShouldHandleEdgeCaseWithExactLimit() {
        // Given
        int limit = 10;
        List<BookView> exactlyTenBooks = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            Book book = new Book("Book " + i, "Author " + i);
            book.setId((long) i);
            BookView bookView = new BookView(book, (long) (100 - i));
            exactlyTenBooks.add(bookView);
        }
        when(bookViewRepository.findTop10ByOrderByViewCountDesc()).thenReturn(exactlyTenBooks);

        // When
        List<BookResponse> result = popularityService.getMostPopularBooks(limit);

        // Then
        assertNotNull(result);
        assertEquals(10, result.size());
        assertEquals("Book 1", result.get(0).getTitle());
        assertEquals(99L, result.get(0).getViewCount());
        verify(bookViewRepository).findTop10ByOrderByViewCountDesc();
    }
}