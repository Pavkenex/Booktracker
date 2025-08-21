package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AdminService {
    
    private final BookRepository bookRepository;
    private final GenreRepository genreRepository;
    private final UserRepository userRepository;
    private final BookService bookService;
    private final GenreService genreService;
    private final ReportService reportService;
    
    public AdminService(BookRepository bookRepository,
                       GenreRepository genreRepository,
                       UserRepository userRepository,
                       BookService bookService,
                       GenreService genreService,
                       ReportService reportService) {
        this.bookRepository = bookRepository;
        this.genreRepository = genreRepository;
        this.userRepository = userRepository;
        this.bookService = bookService;
        this.genreService = genreService;
        this.reportService = reportService;
    }

    
    /**
     * Get admin dashboard statistics
     */
    public AdminStatsDTO getAdminStats() {
        long totalUsers = userRepository.countTotalUsers();
        long totalBooks = bookRepository.countTotalBooks();
        long totalGenres = genreRepository.count();
        
        return new AdminStatsDTO(
            (int) totalUsers,
            (int) totalBooks,
            (int) totalGenres
        );
    }
    
    // Book Management - Delegate to BookService
    
    public BookResponse createBook(AdminBookRequest request) {
        return bookService.createBook(request);
    }
    
    public BookResponse updateBook(Long bookId, AdminBookRequest request) {
        return bookService.updateBook(bookId, request);
    }
    
    public void deleteBook(Long bookId) {
        bookService.deleteBook(bookId);
    }
    
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        return bookService.getAllBooksForAdmin(pageable);
    }
    
    public BookResponse getBookById(Long bookId) {
        return bookService.getBookByIdRequired(bookId);
    }
    
    // Genre Management - Delegate to GenreService
    
    public GenreResponse createGenre(AdminGenreRequest request) {
        return genreService.createGenreForAdmin(request);
    }
    
    public GenreResponse updateGenre(Long genreId, AdminGenreRequest request) {
        return genreService.updateGenreForAdmin(genreId, request);
    }
    
    public void deleteGenre(Long genreId) {
        genreService.deleteGenreForAdmin(genreId);
    }
    
    public List<GenreResponse> getAllGenres() {
        return genreService.getAllGenres();
    }
    
    public GenreResponse getGenreById(Long genreId) {
        return genreService.getGenreByIdForAdmin(genreId);
    }
    
    // Report Generation - Delegate to ReportService
    
    public List<BooksByCategoryReportData> getBooksByCategoryData() {
        return reportService.getBooksByCategoryData();
    }
    
    public List<DailyActivityReportData> getDailyActivityData(LocalDate startDate, LocalDate endDate) {
        return reportService.getDailyActivityData(startDate, endDate);
    }
    
    public List<UserEngagementReportData> getUserEngagementData() {
        return reportService.getUserEngagementData();
    }
    
    public List<PopularityStatisticsData> getPopularityStatisticsData() {
        return reportService.getPopularityStatisticsData();
    }
    
    // Report Export - Delegate to ReportService
    
    public byte[] exportBooksByCategoryReport(String format) throws Exception {
        return reportService.exportBooksByCategoryReport(format);
    }
    
    public byte[] exportDailyActivityReport(LocalDate startDate, LocalDate endDate, String format) throws Exception {
        return reportService.exportDailyActivityReport(startDate, endDate, format);
    }
    
    public byte[] exportUserEngagementReport(String format) throws Exception {
        return reportService.exportUserEngagementReport(format);
    }
    
    public byte[] exportPopularityStatisticsReport(String format) throws Exception {
        return reportService.exportPopularityStatisticsReport(format);
    }
}