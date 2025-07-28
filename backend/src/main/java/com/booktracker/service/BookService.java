package com.booktracker.service;

import com.booktracker.dto.BookRequest;
import com.booktracker.dto.BookResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private GenreRepository genreRepository;

    /**
     * Get all books with pagination
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookResponse> getAllBooks(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> bookPage = bookRepository.findAll(pageable);
        
        List<BookResponse> bookResponses = bookPage.getContent().stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
        
        return new PagedResponse<>(bookResponses, bookPage);
    }

    /**
     * Search books by title or author
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookResponse> searchBooks(String searchTerm, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> bookPage = bookRepository.findByTitleOrAuthorContainingIgnoreCase(searchTerm, pageable);
        
        List<BookResponse> bookResponses = bookPage.getContent().stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
        
        return new PagedResponse<>(bookResponses, bookPage);
    }

    /**
     * Filter books with multiple criteria
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookResponse> filterBooks(String title, String author, Long genreId, 
                                                  Integer publishedYear, int page, int size, 
                                                  String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> bookPage = bookRepository.findBooksWithFilters(title, author, genreId, publishedYear, pageable);
        
        List<BookResponse> bookResponses = bookPage.getContent().stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
        
        return new PagedResponse<>(bookResponses, bookPage);
    }

    /**
     * Get books by genre
     */
    @Transactional(readOnly = true)
    public PagedResponse<BookResponse> getBooksByGenre(Long genreId, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> bookPage = bookRepository.findByGenreId(genreId, pageable);
        
        List<BookResponse> bookResponses = bookPage.getContent().stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
        
        return new PagedResponse<>(bookResponses, bookPage);
    }

    /**
     * Get book by ID
     */
    @Transactional(readOnly = true)
    public Optional<BookResponse> getBookById(Long id) {
        return bookRepository.findById(id)
                .map(BookResponse::new);
    }

    /**
     * Create a new book
     */
    public BookResponse createBook(BookRequest bookRequest) {
        Book book = new Book();
        book.setTitle(bookRequest.getTitle());
        book.setAuthor(bookRequest.getAuthor());
        book.setPublishedYear(bookRequest.getPublishedYear());
        book.setThumbnail(bookRequest.getThumbnail());
        book.setDescription(bookRequest.getDescription());

        // Set genres if provided
        if (bookRequest.getGenreIds() != null && !bookRequest.getGenreIds().isEmpty()) {
            Set<Genre> genres = new HashSet<>();
            for (Long genreId : bookRequest.getGenreIds()) {
                genreRepository.findById(genreId).ifPresent(genres::add);
            }
            book.setGenres(genres);
        }

        Book savedBook = bookRepository.save(book);
        return new BookResponse(savedBook);
    }

    /**
     * Update an existing book
     */
    public Optional<BookResponse> updateBook(Long id, BookRequest bookRequest) {
        return bookRepository.findById(id)
                .map(book -> {
                    book.setTitle(bookRequest.getTitle());
                    book.setAuthor(bookRequest.getAuthor());
                    book.setPublishedYear(bookRequest.getPublishedYear());
                    book.setThumbnail(bookRequest.getThumbnail());
                    book.setDescription(bookRequest.getDescription());

                    // Update genres if provided
                    if (bookRequest.getGenreIds() != null) {
                        Set<Genre> genres = new HashSet<>();
                        for (Long genreId : bookRequest.getGenreIds()) {
                            genreRepository.findById(genreId).ifPresent(genres::add);
                        }
                        book.setGenres(genres);
                    }

                    Book savedBook = bookRepository.save(book);
                    return new BookResponse(savedBook);
                });
    }

    /**
     * Delete a book
     */
    public boolean deleteBook(Long id) {
        if (bookRepository.existsById(id)) {
            bookRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get most popular books
     */
    @Transactional(readOnly = true)
    public List<BookResponse> getMostPopularBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Book> books = bookRepository.findMostPopularBooks(pageable);
        return books.stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get recently added books
     */
    @Transactional(readOnly = true)
    public List<BookResponse> getRecentlyAddedBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Book> books = bookRepository.findRecentlyAddedBooks(pageable);
        return books.stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * Get total book count
     */
    @Transactional(readOnly = true)
    public long getTotalBookCount() {
        return bookRepository.countTotalBooks();
    }
}