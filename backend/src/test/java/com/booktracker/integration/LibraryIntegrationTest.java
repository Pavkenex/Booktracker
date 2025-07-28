package com.booktracker.integration;

import com.booktracker.dto.UserBookRequest;
import com.booktracker.dto.UserBookResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.User;
import com.booktracker.entity.UserBook;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.UserBookRepository;
import com.booktracker.repository.UserRepository;
import com.booktracker.service.LibraryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class LibraryIntegrationTest {

    @Autowired
    private LibraryService libraryService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserBookRepository userBookRepository;

    private User testUser;
    private Book testBook;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser = userRepository.save(testUser);

        // Create test book
        testBook = new Book();
        testBook.setTitle("Test Book");
        testBook.setAuthor("Test Author");
        testBook.setPublishedYear(2023);
        testBook = bookRepository.save(testBook);
    }

    @Test
    void testCompleteLibraryWorkflow() {
        // Test adding book to library
        UserBookRequest addRequest = new UserBookRequest();
        addRequest.setBookId(testBook.getId());
        addRequest.setStatus(UserBook.ReadingStatus.to_read);
        addRequest.setIsFavourite(false);

        UserBookResponse addedBook = libraryService.addBookToLibrary(testUser.getId(), addRequest);
        assertNotNull(addedBook);
        assertEquals(testBook.getId(), addedBook.getBook().getId());
        assertEquals(UserBook.ReadingStatus.to_read, addedBook.getStatus());
        assertFalse(addedBook.getIsFavourite());

        // Test updating book status
        UserBookRequest updateRequest = new UserBookRequest();
        updateRequest.setBookId(testBook.getId());
        updateRequest.setStatus(UserBook.ReadingStatus.read);
        updateRequest.setRating(5);
        updateRequest.setReview("Great book!");
        updateRequest.setReadDate(LocalDate.now());
        updateRequest.setIsFavourite(true);

        UserBookResponse updatedBook = libraryService.updateBookInLibrary(
                testUser.getId(), addedBook.getId(), updateRequest);
        assertNotNull(updatedBook);
        assertEquals(UserBook.ReadingStatus.read, updatedBook.getStatus());
        assertEquals(5, updatedBook.getRating());
        assertEquals("Great book!", updatedBook.getReview());
        assertTrue(updatedBook.getIsFavourite());

        // Test getting user library
        Page<UserBookResponse> library = libraryService.getUserLibrary(
                testUser.getId(), 0, 10, "id", "desc");
        assertNotNull(library);
        assertEquals(1, library.getContent().size());
        assertEquals(updatedBook.getId(), library.getContent().get(0).getId());

        // Test getting library by status
        Page<UserBookResponse> readBooks = libraryService.getUserLibraryByStatus(
                testUser.getId(), UserBook.ReadingStatus.read, 0, 10, "id", "desc");
        assertNotNull(readBooks);
        assertEquals(1, readBooks.getContent().size());

        // Test getting favorite books
        Page<UserBookResponse> favoriteBooks = libraryService.getUserFavoriteBooks(
                testUser.getId(), 0, 10, "id", "desc");
        assertNotNull(favoriteBooks);
        assertEquals(1, favoriteBooks.getContent().size());

        // Test library statistics
        var stats = libraryService.getLibraryStats(testUser.getId());
        assertNotNull(stats);
        assertEquals(1, stats.getTotalBooks());
        assertEquals(1, stats.getBooksRead());
        assertEquals(0, stats.getBooksToRead());
        assertEquals(1, stats.getFavoriteBooks());
        assertEquals(5.0, stats.getAverageRating());

        // Test checking if book exists in library
        boolean hasBook = libraryService.hasBookInLibrary(testUser.getId(), testBook.getId());
        assertTrue(hasBook);

        // Test removing book from library
        libraryService.removeBookFromLibrary(testUser.getId(), addedBook.getId());
        
        // Verify book is removed
        Page<UserBookResponse> emptyLibrary = libraryService.getUserLibrary(
                testUser.getId(), 0, 10, "id", "desc");
        assertEquals(0, emptyLibrary.getContent().size());
    }

    @Test
    void testToggleFavorite() {
        // Add book to library
        UserBookRequest request = new UserBookRequest();
        request.setBookId(testBook.getId());
        request.setStatus(UserBook.ReadingStatus.to_read);
        request.setIsFavourite(false);

        UserBookResponse addedBook = libraryService.addBookToLibrary(testUser.getId(), request);
        assertFalse(addedBook.getIsFavourite());

        // Toggle favorite to true
        UserBookResponse toggledBook = libraryService.toggleFavorite(testUser.getId(), addedBook.getId());
        assertTrue(toggledBook.getIsFavourite());

        // Toggle favorite back to false
        UserBookResponse toggledAgain = libraryService.toggleFavorite(testUser.getId(), addedBook.getId());
        assertFalse(toggledAgain.getIsFavourite());
    }
}