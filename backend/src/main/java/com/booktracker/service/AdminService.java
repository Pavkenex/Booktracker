package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.entity.Book;
import com.booktracker.entity.Genre;
import com.booktracker.entity.User;
import com.booktracker.exception.ResourceNotFoundException;
import com.booktracker.repository.*;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.export.JRPdfExporter;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimplePdfExporterConfiguration;
import net.sf.jasperreports.export.SimpleXlsxReportConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private GenreRepository genreRepository;
    
    @Autowired
    private UserRepository userRepository;
    

    
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
    
    @Autowired
    private UserBookRepository userBookRepository;
    
    @Autowired
    private FriendshipRepository friendshipRepository;
    
    @Autowired
    private RecommendationRepository recommendationRepository;
    
    @Autowired
    private PopularityService popularityService;
    
    // Book Management
    
    public BookResponse createBook(AdminBookRequest request) {
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPublishedYear(request.getPublishedYear());
        book.setThumbnail(request.getThumbnail());
        book.setDescription(request.getDescription());
        
        // Add genres if provided
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            Set<Genre> genres = new HashSet<>();
            for (Long genreId : request.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
                genres.add(genre);
            }
            book.setGenres(genres);
        }
        
        Book savedBook = bookRepository.save(book);
        return convertToBookResponse(savedBook);
    }
    
    public BookResponse updateBook(Long bookId, AdminBookRequest request) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setPublishedYear(request.getPublishedYear());
        book.setThumbnail(request.getThumbnail());
        book.setDescription(request.getDescription());
        
        // Update genres
        book.getGenres().clear();
        if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
            Set<Genre> genres = new HashSet<>();
            for (Long genreId : request.getGenreIds()) {
                Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
                genres.add(genre);
            }
            book.setGenres(genres);
        }
        
        Book savedBook = bookRepository.save(book);
        return convertToBookResponse(savedBook);
    }
    
    public void deleteBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        
        bookRepository.delete(book);
    }
    
    public Page<BookResponse> getAllBooks(Pageable pageable) {
        Page<Book> books = bookRepository.findAll(pageable);
        return books.map(this::convertToBookResponse);
    }
    
    public BookResponse getBookById(Long bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        return convertToBookResponse(book);
    }
    
    // Genre Management
    
    public GenreResponse createGenre(AdminGenreRequest request) {
        if (genreRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Genre with name '" + request.getName() + "' already exists");
        }
        
        Genre genre = new Genre();
        genre.setName(request.getName());
        
        Genre savedGenre = genreRepository.save(genre);
        return convertToGenreResponse(savedGenre);
    }
    
    public GenreResponse updateGenre(Long genreId, AdminGenreRequest request) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        
        // Check if name already exists (excluding current genre)
        Optional<Genre> existingGenre = genreRepository.findByNameIgnoreCase(request.getName());
        if (existingGenre.isPresent() && !existingGenre.get().getId().equals(genreId)) {
            throw new IllegalArgumentException("Genre with name '" + request.getName() + "' already exists");
        }
        
        genre.setName(request.getName());
        Genre savedGenre = genreRepository.save(genre);
        return convertToGenreResponse(savedGenre);
    }
    
    public void deleteGenre(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        
        // Check if genre has books
        if (!genre.getBooks().isEmpty()) {
            throw new IllegalArgumentException("Cannot delete genre that has books assigned to it. Please reassign books to other genres first.");
        }
        
        genreRepository.delete(genre);
    }
    
    public List<GenreResponse> getAllGenres() {
        List<Genre> genres = genreRepository.findAllByOrderByNameAsc();
        return genres.stream()
            .map(this::convertToGenreResponse)
            .collect(Collectors.toList());
    }
    
    public GenreResponse getGenreById(Long genreId) {
        Genre genre = genreRepository.findById(genreId)
            .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + genreId));
        return convertToGenreResponse(genre);
    }
    
    // Report Generation
    
    public List<BooksByCategoryReportData> getBooksByCategoryData() {
        List<Object[]> results = genreRepository.countBooksByGenre();
        long totalBooks = bookRepository.count();
        
        return results.stream()
            .map(result -> {
                String categoryName = (String) result[0];
                Long bookCount = (Long) result[1];
                Double percentage = totalBooks > 0 ? (bookCount.doubleValue() / totalBooks) * 100 : 0.0;
                return new BooksByCategoryReportData(categoryName, bookCount, percentage);
            })
            .collect(Collectors.toList());
    }
    
    public List<DailyActivityReportData> getDailyActivityData(LocalDate startDate, LocalDate endDate) {
        List<DailyActivityReportData> reportData = new ArrayList<>();
        
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            Long userRegistrations = userRepository.countUsersRegisteredOnDate(currentDate);
            // Use the new method to count books created on this date instead of books added to user libraries
            Long booksAdded = bookRepository.countBooksCreatedOnDate(currentDate);
            Long reviewsPosted = userBookRepository.countReviewsPostedOnDate(currentDate);
            Long friendRequestsSent = friendshipRepository.countFriendRequestsSentOnDate(currentDate);
            Long recommendationsSent = recommendationRepository.countRecommendationsSentOnDate(currentDate);
            
            DailyActivityReportData data = new DailyActivityReportData();
            data.setDate(currentDate);
            data.setUserRegistrations(userRegistrations);
            data.setBooksAdded(booksAdded);
            data.setReviewsPosted(reviewsPosted);
            data.setFriendRequestsSent(friendRequestsSent);
            data.setRecommendationsSent(recommendationsSent);
            
            reportData.add(data);
            currentDate = currentDate.plusDays(1);
        }
        
        return reportData;
    }
    
    public List<UserEngagementReportData> getUserEngagementData() {
        List<Object[]> results = userRepository.getUserEngagementData();
        
        // Process raw user data into individual user records
        List<UserEngagementReportData> detailedData = results.stream()
            .map(result -> {
                UserEngagementReportData data = new UserEngagementReportData();
                data.setUsername((String) result[0]);
                data.setEmail((String) result[1]);
                data.setTotalBooks((Long) result[2]);
                data.setBooksRead((Long) result[3]);
                data.setBooksToRead((Long) result[4]);
                data.setFriendsCount((Long) result[5]);
                data.setRecommendationsSent((Long) result[6]);
                data.setAverageRating((Double) result[7]);
                data.setReviewsWritten((Long) result[8]);
                return data;
            })
            .collect(Collectors.toList());
        
        // Create aggregated metrics for frontend display
        List<UserEngagementReportData> metrics = new ArrayList<>();
        
        // Calculate aggregated metrics
        long totalUsers = userRepository.countTotalUsers();
        long totalBooksInLibraries = detailedData.stream().mapToLong(UserEngagementReportData::getTotalBooks).sum();
        long totalBooksRead = detailedData.stream().mapToLong(UserEngagementReportData::getBooksRead).sum();
        long totalToRead = detailedData.stream().mapToLong(UserEngagementReportData::getBooksToRead).sum();
        // Removed totalFriends and totalRecommendations calculations
        long totalReviews = detailedData.stream().mapToLong(UserEngagementReportData::getReviewsWritten).sum();
        
        // Average ratings (ignoring nulls)
        double avgRatingSum = detailedData.stream()
            .filter(d -> d.getAverageRating() != null)
            .mapToDouble(UserEngagementReportData::getAverageRating)
            .average()
            .orElse(0);
        
        // Create metrics
        UserEngagementReportData totalUsersMetric = new UserEngagementReportData();
        totalUsersMetric.setMetric("Total Users");
        totalUsersMetric.setValue(totalUsers);
        metrics.add(totalUsersMetric);
        
        UserEngagementReportData avgBooksPerUser = new UserEngagementReportData();
        avgBooksPerUser.setMetric("Avg Books Per User");
        avgBooksPerUser.setValue(totalUsers > 0 ? (double) totalBooksInLibraries / totalUsers : 0);
        metrics.add(avgBooksPerUser);
        
        UserEngagementReportData totalBooksReadMetric = new UserEngagementReportData();
        totalBooksReadMetric.setMetric("Total Books Read");
        totalBooksReadMetric.setValue(totalBooksRead);
        metrics.add(totalBooksReadMetric);
        
        UserEngagementReportData totalToReadMetric = new UserEngagementReportData();
        totalToReadMetric.setMetric("Total Books To Read");
        totalToReadMetric.setValue(totalToRead);
        metrics.add(totalToReadMetric);
        
        UserEngagementReportData avgRatingMetric = new UserEngagementReportData();
        avgRatingMetric.setMetric("Average Book Rating");
        avgRatingMetric.setValue(avgRatingSum);
        metrics.add(avgRatingMetric);
        
        UserEngagementReportData totalReviewsMetric = new UserEngagementReportData();
        totalReviewsMetric.setMetric("Total Reviews Written");
        totalReviewsMetric.setValue(totalReviews);
        metrics.add(totalReviewsMetric);
        
        // Removed Total Friendships and Total Recommendations metrics
        
        return metrics;
    }
    
    public List<PopularityStatisticsData> getPopularityStatisticsData() {
        List<BookResponse> popularityData = popularityService.getPopularityStatistics();
        
        if (popularityData.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Calculate total views for percentage calculation
        long totalViews = popularityData.stream()
            .mapToLong(book -> book.getViewCount() != null ? book.getViewCount() : 0L)
            .sum();
        
        List<PopularityStatisticsData> statisticsData = new ArrayList<>();
        
        for (int i = 0; i < popularityData.size(); i++) {
            BookResponse book = popularityData.get(i);
            Long viewCount = book.getViewCount() != null ? book.getViewCount() : 0L;
            Double percentage = totalViews > 0 ? (viewCount.doubleValue() / totalViews) * 100 : 0.0;
            Integer rank = i + 1;
            
            PopularityStatisticsData data = new PopularityStatisticsData(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                viewCount,
                percentage,
                rank
            );
            
            statisticsData.add(data);
        }
        
        return statisticsData;
    }
    
    // Report Export Methods
    
    public byte[] exportBooksByCategoryReport(String format) throws JRException {
        List<BooksByCategoryReportData> data = getBooksByCategoryData();
        return generateReport("books_by_category_report", data, format);
    }
    
    public byte[] exportDailyActivityReport(LocalDate startDate, LocalDate endDate, String format) throws JRException {
        List<DailyActivityReportData> data = getDailyActivityData(startDate, endDate);
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("startDate", startDate);
        parameters.put("endDate", endDate);
        return generateReport("daily_activity_report", data, format, parameters);
    }
    
    public byte[] exportUserEngagementReport(String format) throws JRException {
        List<UserEngagementReportData> data = getUserEngagementData();
        return generateReport("user_engagement_report", data, format);
    }
    
    public byte[] exportPopularityStatisticsReport(String format) throws JRException {
        List<PopularityStatisticsData> data = getPopularityStatisticsData();
        return generateReport("popularity_statistics_report", data, format);
    }
    
    private byte[] generateReport(String reportName, List<?> data, String format) throws JRException {
        return generateReport(reportName, data, format, new HashMap<>());
    }
    
    private byte[] generateReport(String reportName, List<?> data, String format, Map<String, Object> parameters) throws JRException {
        try {
            // Load the report template
            InputStream reportStream = getClass().getResourceAsStream("/reports/" + reportName + ".jrxml");
            if (reportStream == null) {
                throw new JRException("Report template not found: " + reportName + ".jrxml");
            }
            
            JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);
            
            // Create data source
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(data);
            
            // Fill the report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);
            
            // Export based on format
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            if ("pdf".equalsIgnoreCase(format)) {
                JRPdfExporter exporter = new JRPdfExporter();
                exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
                
                SimplePdfExporterConfiguration configuration = new SimplePdfExporterConfiguration();
                exporter.setConfiguration(configuration);
                exporter.exportReport();
            } else if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                JRXlsxExporter exporter = new JRXlsxExporter();
                exporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
                
                SimpleXlsxReportConfiguration configuration = new SimpleXlsxReportConfiguration();
                configuration.setOnePagePerSheet(false);
                configuration.setDetectCellType(true);
                exporter.setConfiguration(configuration);
                exporter.exportReport();
            } else if ("csv".equalsIgnoreCase(format)) {
                return generateCsvReport(data, reportName);
            } else {
                throw new IllegalArgumentException("Unsupported export format: " + format);
            }
            
            return outputStream.toByteArray();
            
        } catch (Exception e) {
            throw new JRException("Error generating report: " + e.getMessage(), e);
        }
    }
    
    private byte[] generateCsvReport(List<?> data, String reportName) {
        StringBuilder csv = new StringBuilder();
        
        if ("popularity_statistics_report".equals(reportName)) {
            // CSV header for popularity statistics
            csv.append("Rank,Book Title,Author,View Count,Percentage\n");
            
            // CSV data rows
            for (Object item : data) {
                if (item instanceof PopularityStatisticsData) {
                    PopularityStatisticsData stats = (PopularityStatisticsData) item;
                    csv.append(stats.getRank()).append(",")
                       .append("\"").append(escapeCsvValue(stats.getTitle())).append("\",")
                       .append("\"").append(escapeCsvValue(stats.getAuthor())).append("\",")
                       .append(stats.getViewCount()).append(",")
                       .append(String.format("%.2f%%", stats.getPercentage()))
                       .append("\n");
                }
            }
        } else {
            // Fallback for other report types - basic CSV generation
            csv.append("Data not available in CSV format for this report type\n");
        }
        
        return csv.toString().getBytes();
    }
    
    private String escapeCsvValue(String value) {
        if (value == null) {
            return "";
        }
        // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return escaped;
        }
        return escaped;
    }
    
    // Helper Methods
    
    private BookResponse convertToBookResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setPublishedYear(book.getPublishedYear());
        response.setThumbnail(book.getThumbnail());
        response.setDescription(book.getDescription());
        
        if (book.getGenres() != null && !book.getGenres().isEmpty()) {
            Set<GenreResponse> genreResponses = book.getGenres().stream()
                .map(this::convertToGenreResponse)
                .collect(Collectors.toSet());
            response.setGenres(genreResponses);
        }
        
        return response;
    }
    
    private GenreResponse convertToGenreResponse(Genre genre) {
        GenreResponse response = new GenreResponse();
        response.setId(genre.getId());
        response.setName(genre.getName());
        return response;
    }
}