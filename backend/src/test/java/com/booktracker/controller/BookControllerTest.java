package com.booktracker.controller;

import com.booktracker.dto.BookResponse;
import com.booktracker.service.BookService;
import com.booktracker.service.PopularityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookControllerTest {

    @Mock
    private BookService bookService;

    @Mock
    private PopularityService popularityService;

    @InjectMocks
    private BookController bookController;

    private BookResponse bookResponse;

    @BeforeEach
    void setUp() {
        bookResponse = new BookResponse();
        bookResponse.setId(1L);
        bookResponse.setTitle("Test Book");
        bookResponse.setAuthor("Test Author");
        bookResponse.setPublishedYear(2023);
        bookResponse.setDescription("Test Description");
    }

    @Test
    void getBookById_Success_TriggersViewRecording() throws Exception {
        // Arrange
        when(bookService.getBookById(1L)).thenReturn(Optional.of(bookResponse));
        doNothing().when(popularityService).recordBookView(1L);

        // Act
        ResponseEntity<BookResponse> response = bookController.getBookById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
        assertEquals("Test Book", response.getBody().getTitle());
        assertEquals("Test Author", response.getBody().getAuthor());

        // Verify that the book service was called
        verify(bookService).getBookById(1L);
        
        // Give some time for async operation to complete
        Thread.sleep(100);
        
        // Verify that view recording was triggered asynchronously
        verify(popularityService, timeout(1000)).recordBookView(1L);
    }

    @Test
    void getBookById_BookNotFound_NoViewRecording() throws Exception {
        // Arrange
        when(bookService.getBookById(999L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<BookResponse> response = bookController.getBookById(999L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());

        // Verify that the book service was called
        verify(bookService).getBookById(999L);
        
        // Verify that view recording was NOT triggered for non-existent book
        verify(popularityService, never()).recordBookView(999L);
    }

    @Test
    void getBookById_ViewRecordingFails_BookDetailStillReturned() throws Exception {
        // Arrange
        when(bookService.getBookById(1L)).thenReturn(Optional.of(bookResponse));
        doThrow(new RuntimeException("Database error")).when(popularityService).recordBookView(1L);

        // Act
        ResponseEntity<BookResponse> response = bookController.getBookById(1L);

        // Assert - Book detail should still be returned even if view recording fails
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getId());
        assertEquals("Test Book", response.getBody().getTitle());

        // Verify that the book service was called
        verify(bookService).getBookById(1L);
        
        // Give some time for async operation to complete
        Thread.sleep(100);
        
        // Verify that view recording was attempted despite the failure
        verify(popularityService, timeout(1000)).recordBookView(1L);
    }

    @Test
    void getBookById_InvalidId_NoViewRecording() throws Exception {
        // Arrange
        when(bookService.getBookById(0L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<BookResponse> response = bookController.getBookById(0L);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        // Verify that the book service was called
        verify(bookService).getBookById(0L);
        
        // Verify that view recording was NOT triggered for invalid ID
        verify(popularityService, never()).recordBookView(0L);
    }

    @Test
    void getBookById_MultipleRequests_MultipleViewRecordings() throws Exception {
        // Arrange
        when(bookService.getBookById(1L)).thenReturn(Optional.of(bookResponse));
        doNothing().when(popularityService).recordBookView(1L);

        // Act - Make multiple requests
        ResponseEntity<BookResponse> response1 = bookController.getBookById(1L);
        ResponseEntity<BookResponse> response2 = bookController.getBookById(1L);

        // Assert
        assertEquals(HttpStatus.OK, response1.getStatusCode());
        assertEquals(HttpStatus.OK, response2.getStatusCode());
        
        verify(bookService, times(2)).getBookById(1L);
        
        // Give some time for async operations to complete
        Thread.sleep(200);
        
        // Verify that view recording was triggered for each request
        verify(popularityService, timeout(1000).times(2)).recordBookView(1L);
    }
}