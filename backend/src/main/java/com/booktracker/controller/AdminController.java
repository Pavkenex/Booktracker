package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.service.AdminService;
import com.booktracker.service.BookService;
import com.booktracker.service.GenreService;
import com.booktracker.service.ReportService;
import jakarta.validation.Valid;
import net.sf.jasperreports.engine.JRException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @Autowired
    private BookService bookService;
    
    @Autowired
    private GenreService genreService;
    
    @Autowired
    private ReportService reportService;
    
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponseDto> getAdminStats() {
        AdminStatsResponseDto stats = adminService.getAdminStats();
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping("/books")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody BookRequestDto request) {
        BookResponse book = bookService.createBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(book);
    }
    
    @PutMapping("/books/{id}")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @Valid @RequestBody BookRequestDto request) {
        BookResponse book = bookService.updateBook(id, request).orElse(null);
        return ResponseEntity.ok(book);
    }
    
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/books")
    public ResponseEntity<PagedResponse<BookResponse>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<BookResponse> books = bookService.getAllBooksForAdmin(pageable);
        PagedResponse<BookResponse> response = new PagedResponse<>(books);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/books/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse book = bookService.getBookByIdRequired(id);
        return ResponseEntity.ok(book);
    }
    
    @PostMapping("/genres")
    public ResponseEntity<GenreResponse> createGenre(@Valid @RequestBody GenreRequestDto request) {
        GenreResponse genre = genreService.createGenreForAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(genre);
    }
    
    @PutMapping("/genres/{id}")
    public ResponseEntity<GenreResponse> updateGenre(@PathVariable Long id, @Valid @RequestBody GenreRequestDto request) {
        GenreResponse genre = genreService.updateGenreForAdmin(id, request);
        return ResponseEntity.ok(genre);
    }
    
    @DeleteMapping("/genres/{id}")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenreForAdmin(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/genres")
    public ResponseEntity<List<GenreResponse>> getAllGenres() {
        List<GenreResponse> genres = genreService.getAllGenres();
        return ResponseEntity.ok(genres);
    }
    
    @GetMapping("/genres/{id}")
    public ResponseEntity<GenreResponse> getGenreById(@PathVariable Long id) {
        GenreResponse genre = genreService.getGenreByIdForAdmin(id);
        return ResponseEntity.ok(genre);
    }
    
    @GetMapping("/reports/books-by-category")
    public ResponseEntity<List<BooksByCategoryReportData>> getBooksByCategoryReport() {
        List<BooksByCategoryReportData> data = reportService.getBooksByCategoryData();
        return ResponseEntity.ok(data);
    }
    
    
    @GetMapping("/reports/daily-activity")
    public ResponseEntity<List<DailyActivityReportData>> getDailyActivityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().build();
        }
        
        List<DailyActivityReportData> data = reportService.getDailyActivityData(startDate, endDate);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/reports/user-engagement")
    public ResponseEntity<List<UserEngagementReportData>> getUserEngagementReport() {
        List<UserEngagementReportData> data = reportService.getUserEngagementData();
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/reports/books-by-category/export")
    public ResponseEntity<byte[]> exportBooksByCategoryReport(@RequestParam String format) {
        try {
            byte[] reportData = reportService.exportBooksByCategoryReport(format);
            
            HttpHeaders headers = new HttpHeaders();
            String filename = "books_by_category_report." + format.toLowerCase();
            headers.setContentDispositionFormData("attachment", filename);
            
            if ("pdf".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.APPLICATION_PDF);
            } else if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            }
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
                
        } catch (JRException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(("Error generating report: " + e.getMessage()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(("Invalid request: " + e.getMessage()).getBytes());
        }
    }
    
    @GetMapping("/reports/daily-activity/export")
    public ResponseEntity<byte[]> exportDailyActivityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam String format) {
        
        try {
            if (startDate.isAfter(endDate)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Start date cannot be after end date".getBytes());
            }
            
            byte[] reportData = reportService.exportDailyActivityReport(startDate, endDate, format);
            
            HttpHeaders headers = new HttpHeaders();
            String filename = "daily_activity_report." + format.toLowerCase();
            headers.setContentDispositionFormData("attachment", filename);
            
            if ("pdf".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.APPLICATION_PDF);
            } else if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            }
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
                
        } catch (JRException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(("Error generating report: " + e.getMessage()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(("Invalid request: " + e.getMessage()).getBytes());
        }
    }
    
    @GetMapping("/reports/user-engagement/export")
    public ResponseEntity<byte[]> exportUserEngagementReport(@RequestParam String format) {
        try {
            byte[] reportData = reportService.exportUserEngagementReport(format);
            
            HttpHeaders headers = new HttpHeaders();
            String filename = "user_engagement_report." + format.toLowerCase();
            headers.setContentDispositionFormData("attachment", filename);
            
            if ("pdf".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.APPLICATION_PDF);
            } else if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            }
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
                
        } catch (JRException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(("Error generating report: " + e.getMessage()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(("Invalid request: " + e.getMessage()).getBytes());
        }
    }
    
    @GetMapping("/popularity/statistics")
    public ResponseEntity<List<PopularityStatisticsData>> getPopularityStatistics() {
        List<PopularityStatisticsData> data = reportService.getPopularityStatisticsData();
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/popularity/export")
    public ResponseEntity<byte[]> exportPopularityStatistics(@RequestParam String format) {
        try {
            if (!"csv".equalsIgnoreCase(format) && !"pdf".equalsIgnoreCase(format)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid format. Supported formats: csv, pdf".getBytes());
            }
            
            byte[] reportData = reportService.exportPopularityStatisticsReport(format);
            
            HttpHeaders headers = new HttpHeaders();
            String filename = "popularity_statistics_report." + format.toLowerCase();
            headers.setContentDispositionFormData("attachment", filename);
            
            if ("pdf".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.APPLICATION_PDF);
            } else if ("csv".equalsIgnoreCase(format)) {
                headers.setContentType(MediaType.parseMediaType("text/csv"));
            }
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
                
        } catch (JRException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(("Error generating report: " + e.getMessage()).getBytes());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(("Invalid request: " + e.getMessage()).getBytes());
        }
    }
}
