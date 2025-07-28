package com.booktracker.service;

import com.booktracker.dto.BookRequest;
import com.booktracker.dto.BookResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.GenreRepository;
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

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private GenreRepository genreRepository;

    @InjectMocks
    private BookService bookService;

    private Book testBook;
    private Genre testGenre;

    @BeforeEach
    void setUp() {
        testGenre = new Genre("Fiction");
        testGenre.setId(1L);

        testBook = new Book("Test Book", "Test Author");
        testBook.setId(1L);
        testBook.setPublishedYear(2023);
        testBook.setDescription("Test Description");
        testBook.setGenres(Set.of(testGenre));
    }

    @Test
    void getAllBooks_ShouldReturnPagedResponse() {
        // Given
        List<Book> books = Arrays.asList(testBook);
        Page<Book> bookPage = new PageImpl<>(books, PageRequest.of(0, 10), 1);
        
        when(bookRepository.findAll(any(Pageable.class))).thenReturn(bookPage);

        // When
        PagedResponse<BookResponse> result = bookService.getAllBooks(0, 10, "title", "asc");

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Book", result.getContent().get(0).getTitle());
        assertEquals("Test Author", result.getContent().get(0).getAuthor());
        verify(bookRepository).findAll(any(Pageable.class));
    }

    @Test
    void searchBooks_ShouldReturnMatchingBooks() {
        // Given
        List<Book> books = Arrays.asList(testBook);
        Page<Book> bookPage = new PageImpl<>(books, PageRequest.of(0, 10), 1);
        
        when(bookRepository.findByTitleOrAuthorContainingIgnoreCase(eq("Test"), any(Pageable.class)))
                .thenReturn(bookPage);

        // When
        PagedResponse<BookResponse> result = bookService.searchBooks("Test", 0, 10, "title", "asc");

        // Then
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Test Book", result.getContent().get(0).getTitle());
        verify(bookRepository).findByTitleOrAuthorContainingIgnoreCase(eq("Test"), any(Pageable.class));
    }

    @Test
    void getBookById_ShouldReturnBook_WhenExists() {
        // Given
        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));

        // When
        Optional<BookResponse> result = bookService.getBookById(1L);

        // Then
        assertTrue(result.isPresent());
        assertEquals("Test Book", result.get().getTitle());
        assertEquals("Test Author", result.get().getAuthor());
        verify(bookRepository).findById(1L);
    }

    @Test
    void getBookById_ShouldReturnEmpty_WhenNotExists() {
        // Given
        when(bookRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Optional<BookResponse> result = bookService.getBookById(1L);

        // Then
        assertFalse(result.isPresent());
        verify(bookRepository).findById(1L);
    }

    @Test
    void createBook_ShouldCreateAndReturnBook() {
        // Given
        BookRequest request = new BookRequest();
        request.setTitle("New Book");
        request.setAuthor("New Author");
        request.setPublishedYear(2023);
        request.setDescription("New Description");
        request.setGenreIds(Set.of(1L));

        Book savedBook = new Book("New Book", "New Author");
        savedBook.setId(2L);
        savedBook.setPublishedYear(2023);
        savedBook.setDescription("New Description");
        savedBook.setGenres(Set.of(testGenre));

        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));
        when(bookRepository.save(any(Book.class))).thenReturn(savedBook);

        // When
        BookResponse result = bookService.createBook(request);

        // Then
        assertNotNull(result);
        assertEquals("New Book", result.getTitle());
        assertEquals("New Author", result.getAuthor());
        assertEquals(2023, result.getPublishedYear());
        assertEquals("New Description", result.getDescription());
        verify(bookRepository).save(any(Book.class));
        verify(genreRepository).findById(1L);
    }

    @Test
    void updateBook_ShouldUpdateAndReturnBook_WhenExists() {
        // Given
        BookRequest request = new BookRequest();
        request.setTitle("Updated Book");
        request.setAuthor("Updated Author");
        request.setPublishedYear(2024);
        request.setDescription("Updated Description");
        request.setGenreIds(Set.of(1L));

        Book updatedBook = new Book("Updated Book", "Updated Author");
        updatedBook.setId(1L);
        updatedBook.setPublishedYear(2024);
        updatedBook.setDescription("Updated Description");
        updatedBook.setGenres(Set.of(testGenre));

        when(bookRepository.findById(1L)).thenReturn(Optional.of(testBook));
        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));
        when(bookRepository.save(any(Book.class))).thenReturn(updatedBook);

        // When
        Optional<BookResponse> result = bookService.updateBook(1L, request);

        // Then
        assertTrue(result.isPresent());
        assertEquals("Updated Book", result.get().getTitle());
        assertEquals("Updated Author", result.get().getAuthor());
        verify(bookRepository).findById(1L);
        verify(bookRepository).save(any(Book.class));
    }

    @Test
    void deleteBook_ShouldReturnTrue_WhenBookExists() {
        // Given
        when(bookRepository.existsById(1L)).thenReturn(true);

        // When
        boolean result = bookService.deleteBook(1L);

        // Then
        assertTrue(result);
        verify(bookRepository).existsById(1L);
        verify(bookRepository).deleteById(1L);
    }

    @Test
    void deleteBook_ShouldReturnFalse_WhenBookNotExists() {
        // Given
        when(bookRepository.existsById(1L)).thenReturn(false);

        // When
        boolean result = bookService.deleteBook(1L);

        // Then
        assertFalse(result);
        verify(bookRepository).existsById(1L);
        verify(bookRepository, never()).deleteById(1L);
    }
}