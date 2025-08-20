package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.service.AdminService;
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
    
    // Dashboard Statistics Endpoint
    
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getAdminStats() {
        AdminStatsDTO stats = adminService.getAdminStats();
        return ResponseEntity.ok(stats);
    }
    
    // Book Management Endpoints
    
    @PostMapping("/books")
    public ResponseEntity<BookResponse> createBook(@Valid @RequestBody AdminBookRequest request) {
        BookResponse book = adminService.createBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(book);
    }
    
    @PutMapping("/books/{id}")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @Valid @RequestBody AdminBookRequest request) {
        BookResponse book = adminService.updateBook(id, request);
        return ResponseEntity.ok(book);
    }
    
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        adminService.deleteBook(id);
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
        
        Page<BookResponse> books = adminService.getAllBooks(pageable);
        PagedResponse<BookResponse> response = new PagedResponse<>(books);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/books/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse book = adminService.getBookById(id);
        return ResponseEntity.ok(book);
    }
    
    // Genre Management Endpoints
    
    @PostMapping("/genres")
    public ResponseEntity<GenreResponse> createGenre(@Valid @RequestBody AdminGenreRequest request) {
        GenreResponse genre = adminService.createGenre(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(genre);
    }
    
    @PutMapping("/genres/{id}")
    public ResponseEntity<GenreResponse> updateGenre(@PathVariable Long id, @Valid @RequestBody AdminGenreRequest request) {
        GenreResponse genre = adminService.updateGenre(id, request);
        return ResponseEntity.ok(genre);
    }
    
    @DeleteMapping("/genres/{id}")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        adminService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/genres")
    public ResponseEntity<List<GenreResponse>> getAllGenres() {
        List<GenreResponse> genres = adminService.getAllGenres();
        return ResponseEntity.ok(genres);
    }
    
    @GetMapping("/genres/{id}")
    public ResponseEntity<GenreResponse> getGenreById(@PathVariable Long id) {
        GenreResponse genre = adminService.getGenreById(id);
        return ResponseEntity.ok(genre);
    }
    
    // Report Endpoints
    
    @GetMapping("/reports/books-by-category")
    public ResponseEntity<List<BooksByCategoryReportData>> getBooksByCategoryReport() {
        List<BooksByCategoryReportData> data = adminService.getBooksByCategoryData();
        return ResponseEntity.ok(data);
    }
    
    /**
     * Get daily activity report including user registrations, books created, reviews posted, etc.
     * 
     * @param startDate The start date for the report
     * @param endDate The end date for the report
     * @return List of daily activity data
     */
    @GetMapping("/reports/daily-activity")
    public ResponseEntity<List<DailyActivityReportData>> getDailyActivityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate.isAfter(endDate)) {
            return ResponseEntity.badRequest().build();
        }
        
        List<DailyActivityReportData> data = adminService.getDailyActivityData(startDate, endDate);
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/reports/user-engagement")
    public ResponseEntity<List<UserEngagementReportData>> getUserEngagementReport() {
        List<UserEngagementReportData> data = adminService.getUserEngagementData();
        return ResponseEntity.ok(data);
    }
    
    // Report Export Endpoints
    
    @GetMapping("/reports/books-by-category/export")
    public ResponseEntity<byte[]> exportBooksByCategoryReport(@RequestParam String format) {
        try {
            byte[] reportData = adminService.exportBooksByCategoryReport(format);
            
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
            
            byte[] reportData = adminService.exportDailyActivityReport(startDate, endDate, format);
            
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
            byte[] reportData = adminService.exportUserEngagementReport(format);
            
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
    
    // Popularity Statistics Endpoints
    
    @GetMapping("/popularity/statistics")
    public ResponseEntity<List<PopularityStatisticsData>> getPopularityStatistics() {
        List<PopularityStatisticsData> data = adminService.getPopularityStatisticsData();
        return ResponseEntity.ok(data);
    }
    
    @GetMapping("/popularity/export")
    public ResponseEntity<byte[]> exportPopularityStatistics(@RequestParam String format) {
        try {
            // Validate format
            if (!"csv".equalsIgnoreCase(format) && !"pdf".equalsIgnoreCase(format)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid format. Supported formats: csv, pdf".getBytes());
            }
            
            byte[] reportData = adminService.exportPopularityStatisticsReport(format);
            
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