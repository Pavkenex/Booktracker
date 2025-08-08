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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    // Book Management Endpoints
    
    @PostMapping("/books")
    public ResponseEntity<Map<String, Object>> createBook(@Valid @RequestBody AdminBookRequest request) {
        try {
            BookResponse book = adminService.createBook(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book created successfully");
            response.put("data", book);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create book: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @PutMapping("/books/{id}")
    public ResponseEntity<Map<String, Object>> updateBook(@PathVariable Long id, @Valid @RequestBody AdminBookRequest request) {
        try {
            BookResponse book = adminService.updateBook(id, request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book updated successfully");
            response.put("data", book);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update book: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @DeleteMapping("/books/{id}")
    public ResponseEntity<Map<String, Object>> deleteBook(@PathVariable Long id) {
        try {
            adminService.deleteBook(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Book deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete book: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @GetMapping("/books")
    public ResponseEntity<Map<String, Object>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<BookResponse> books = adminService.getAllBooks(pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", books.getContent());
            response.put("currentPage", books.getNumber());
            response.put("totalItems", books.getTotalElements());
            response.put("totalPages", books.getTotalPages());
            response.put("hasNext", books.hasNext());
            response.put("hasPrevious", books.hasPrevious());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve books: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/books/{id}")
    public ResponseEntity<Map<String, Object>> getBookById(@PathVariable Long id) {
        try {
            BookResponse book = adminService.getBookById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", book);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve book: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Genre Management Endpoints
    
    @PostMapping("/genres")
    public ResponseEntity<Map<String, Object>> createGenre(@Valid @RequestBody AdminGenreRequest request) {
        try {
            GenreResponse genre = adminService.createGenre(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Genre created successfully");
            response.put("data", genre);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create genre: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @PutMapping("/genres/{id}")
    public ResponseEntity<Map<String, Object>> updateGenre(@PathVariable Long id, @Valid @RequestBody AdminGenreRequest request) {
        try {
            GenreResponse genre = adminService.updateGenre(id, request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Genre updated successfully");
            response.put("data", genre);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update genre: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @DeleteMapping("/genres/{id}")
    public ResponseEntity<Map<String, Object>> deleteGenre(@PathVariable Long id) {
        try {
            adminService.deleteGenre(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Genre deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete genre: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @GetMapping("/genres")
    public ResponseEntity<Map<String, Object>> getAllGenres() {
        try {
            List<GenreResponse> genres = adminService.getAllGenres();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", genres);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve genres: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/genres/{id}")
    public ResponseEntity<Map<String, Object>> getGenreById(@PathVariable Long id) {
        try {
            GenreResponse genre = adminService.getGenreById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", genre);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve genre: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
    
    // Report Endpoints
    
    @GetMapping("/reports/books-by-category")
    public ResponseEntity<Map<String, Object>> getBooksByCategoryReport() {
        try {
            List<BooksByCategoryReportData> data = adminService.getBooksByCategoryData();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate books by category report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/reports/daily-activity")
    public ResponseEntity<Map<String, Object>> getDailyActivityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            if (startDate.isAfter(endDate)) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Start date cannot be after end date");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            List<DailyActivityReportData> data = adminService.getDailyActivityData(startDate, endDate);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate daily activity report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/reports/user-engagement")
    public ResponseEntity<Map<String, Object>> getUserEngagementReport() {
        try {
            List<UserEngagementReportData> data = adminService.getUserEngagementData();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to generate user engagement report: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
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
    public ResponseEntity<Map<String, Object>> getPopularityStatistics() {
        try {
            List<PopularityStatisticsData> data = adminService.getPopularityStatisticsData();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", data);
            
            if (data.isEmpty()) {
                response.put("message", "No popularity data available. Books need to be viewed to generate statistics.");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve popularity statistics: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
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