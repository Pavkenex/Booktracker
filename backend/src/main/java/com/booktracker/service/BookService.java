package com.booktracker.service;

import com.booktracker.dto.BookRequestDto;
import com.booktracker.dto.BookResponse;
import com.booktracker.dto.PagedResponse;
import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.GenreRepository;
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

    private final BookRepository bookRepository;
    private final GenreRepository genreRepository;
    private final PopularityService popularityService;

    public BookService(BookRepository bookRepository, 
                      GenreRepository genreRepository,
                      PopularityService popularityService) {
        this.bookRepository = bookRepository;
        this.genreRepository = genreRepository;
        this.popularityService = popularityService;
    }

    
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

    
    @Transactional(readOnly = true)
    public Optional<BookResponse> getBookById(Long id) {
        return bookRepository.findById(id)
                .map(BookResponse::new);
    }

    
    @Transactional(readOnly = true)
    public BookResponse getBookByIdRequired(Long id) {
        return bookRepository.findById(id)
                .map(BookResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    
    public BookResponse createBook(BookRequestDto bookRequest) {
        Book book = new Book();
        book.setTitle(bookRequest.getTitle());
        book.setAuthor(bookRequest.getAuthor());
        book.setPublishedYear(bookRequest.getPublishedYear());
        book.setThumbnail(bookRequest.getThumbnail());
        book.setDescription(bookRequest.getDescription());
        book.setCreatedAt(java.time.LocalDate.now());

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

    
    public Optional<BookResponse> updateBook(Long id, BookRequestDto bookRequest) {
        return bookRepository.findById(id)
                .map(book -> {
                    book.setTitle(bookRequest.getTitle());
                    book.setAuthor(bookRequest.getAuthor());
                    book.setPublishedYear(bookRequest.getPublishedYear());
                    book.setThumbnail(bookRequest.getThumbnail());
                    book.setDescription(bookRequest.getDescription());

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

    
    @Transactional(readOnly = true)
    public List<BookResponse> getMostPopularBooks(int limit) {
        return popularityService.getMostPopularBooks(limit);
    }

    
    @Transactional(readOnly = true)
    public List<BookResponse> getRecentlyAddedBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Book> books = bookRepository.findRecentlyAddedBooks(pageable);
        return books.stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
    }

    
    @Transactional(readOnly = true)
    public long getTotalBookCount() {
        return bookRepository.countTotalBooks();
    }

    
    @Transactional(readOnly = true)
    public List<BookResponse> getSimilarBooks(Long bookId, int limit) {
    return bookRepository.findById(bookId)
        .map(book -> {
            if (book.getGenres() == null || book.getGenres().isEmpty()) {
            return List.<BookResponse>of();
            }
            List<Long> genreIds = book.getGenres().stream()
                .map(g -> g.getId())
                .collect(Collectors.toList());
            Pageable pageable = PageRequest.of(0, limit);
            List<Book> similar = bookRepository.findSimilarBooks(genreIds, bookId, pageable);
            return similar.stream()
                .map(BookResponse::new)
                .collect(Collectors.toList());
        }).orElse(List.of());
    }

    
    public void deleteBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        
        bookRepository.delete(book);
    }

    
    public Page<BookResponse> getAllBooksForAdmin(Pageable pageable) {
        Page<Book> books = bookRepository.findAll(pageable);
        return books.map(BookResponse::new);
    }
}
