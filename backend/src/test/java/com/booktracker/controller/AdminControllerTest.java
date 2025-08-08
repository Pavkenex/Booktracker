package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.service.AdminService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @Autowired
    private ObjectMapper objectMapper;

    private BookResponse bookResponse;
    private GenreResponse genreResponse;
    private AdminBookRequest bookRequest;
    private AdminGenreRequest genreRequest;

    @BeforeEach
    void setUp() {
        bookResponse = new BookResponse();
        bookResponse.setId(1L);
        bookResponse.setTitle("Test Book");
        bookResponse.setAuthor("Test Author");
        bookResponse.setPublishedYear(2023);
        bookResponse.setDescription("Test Description");

        genreResponse = new GenreResponse();
        genreResponse.setId(1L);
        genreResponse.setName("Fiction");

        bookRequest = new AdminBookRequest();
        bookRequest.setTitle("Test Book");
        bookRequest.setAuthor("Test Author");
        bookRequest.setPublishedYear(2023);
        bookRequest.setDescription("Test Description");
        bookRequest.setGenreIds(Set.of(1L));

        genreRequest = new AdminGenreRequest();
        genreRequest.setName("Fiction");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createBook_Success() throws Exception {
        // Arrange
        when(adminService.createBook(any(AdminBookRequest.class))).thenReturn(bookResponse);

        // Act & Assert
        mockMvc.perform(post("/api/admin/books")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Book created successfully"))
                .andExpect(jsonPath("$.data.title").value("Test Book"))
                .andExpect(jsonPath("$.data.author").value("Test Author"));

        verify(adminService).createBook(any(AdminBookRequest.class));
    }

    @Test
    @WithMockUser(roles = "USER")
    void createBook_Forbidden() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/admin/books")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isForbidden());

        verify(adminService, never()).createBook(any(AdminBookRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createBook_ValidationError() throws Exception {
        // Arrange
        bookRequest.setTitle(""); // Invalid title

        // Act & Assert
        mockMvc.perform(post("/api/admin/books")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isBadRequest());

        verify(adminService, never()).createBook(any(AdminBookRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateBook_Success() throws Exception {
        // Arrange
        when(adminService.updateBook(eq(1L), any(AdminBookRequest.class))).thenReturn(bookResponse);

        // Act & Assert
        mockMvc.perform(put("/api/admin/books/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Book updated successfully"))
                .andExpect(jsonPath("$.data.title").value("Test Book"));

        verify(adminService).updateBook(eq(1L), any(AdminBookRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteBook_Success() throws Exception {
        // Arrange
        doNothing().when(adminService).deleteBook(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/books/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Book deleted successfully"));

        verify(adminService).deleteBook(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllBooks_Success() throws Exception {
        // Arrange
        List<BookResponse> books = Arrays.asList(bookResponse);
        Page<BookResponse> bookPage = new PageImpl<>(books);
        when(adminService.getAllBooks(any())).thenReturn(bookPage);

        // Act & Assert
        mockMvc.perform(get("/api/admin/books")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Test Book"))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));

        verify(adminService).getAllBooks(any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getBookById_Success() throws Exception {
        // Arrange
        when(adminService.getBookById(1L)).thenReturn(bookResponse);

        // Act & Assert
        mockMvc.perform(get("/api/admin/books/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Book"))
                .andExpect(jsonPath("$.data.author").value("Test Author"));

        verify(adminService).getBookById(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createGenre_Success() throws Exception {
        // Arrange
        when(adminService.createGenre(any(AdminGenreRequest.class))).thenReturn(genreResponse);

        // Act & Assert
        mockMvc.perform(post("/api/admin/genres")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(genreRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Genre created successfully"))
                .andExpect(jsonPath("$.data.name").value("Fiction"));

        verify(adminService).createGenre(any(AdminGenreRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateGenre_Success() throws Exception {
        // Arrange
        when(adminService.updateGenre(eq(1L), any(AdminGenreRequest.class))).thenReturn(genreResponse);

        // Act & Assert
        mockMvc.perform(put("/api/admin/genres/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(genreRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Genre updated successfully"))
                .andExpect(jsonPath("$.data.name").value("Fiction"));

        verify(adminService).updateGenre(eq(1L), any(AdminGenreRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteGenre_Success() throws Exception {
        // Arrange
        doNothing().when(adminService).deleteGenre(1L);

        // Act & Assert
        mockMvc.perform(delete("/api/admin/genres/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Genre deleted successfully"));

        verify(adminService).deleteGenre(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllGenres_Success() throws Exception {
        // Arrange
        List<GenreResponse> genres = Arrays.asList(genreResponse);
        when(adminService.getAllGenres()).thenReturn(genres);

        // Act & Assert
        mockMvc.perform(get("/api/admin/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].name").value("Fiction"));

        verify(adminService).getAllGenres();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getBooksByCategoryReport_Success() throws Exception {
        // Arrange
        List<BooksByCategoryReportData> reportData = Arrays.asList(
            new BooksByCategoryReportData("Fiction", 10L, 66.67)
        );
        when(adminService.getBooksByCategoryData()).thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/reports/books-by-category"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].categoryName").value("Fiction"))
                .andExpect(jsonPath("$.data[0].bookCount").value(10))
                .andExpect(jsonPath("$.data[0].percentage").value(66.67));

        verify(adminService).getBooksByCategoryData();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDailyActivityReport_Success() throws Exception {
        // Arrange
        List<DailyActivityReportData> reportData = Arrays.asList(
            new DailyActivityReportData(LocalDate.of(2023, 1, 1), 5L, 10L, 3L)
        );
        when(adminService.getDailyActivityData(any(LocalDate.class), any(LocalDate.class)))
            .thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/reports/daily-activity")
                .param("startDate", "2023-01-01")
                .param("endDate", "2023-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].userRegistrations").value(5))
                .andExpect(jsonPath("$.data[0].booksAdded").value(10))
                .andExpect(jsonPath("$.data[0].reviewsPosted").value(3));

        verify(adminService).getDailyActivityData(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getDailyActivityReport_InvalidDateRange() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/reports/daily-activity")
                .param("startDate", "2023-01-02")
                .param("endDate", "2023-01-01"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Start date cannot be after end date"));

        verify(adminService, never()).getDailyActivityData(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUserEngagementReport_Success() throws Exception {
        // Arrange
        List<UserEngagementReportData> reportData = Arrays.asList(
            new UserEngagementReportData("user1", "user1@example.com", 10L, 8L)
        );
        when(adminService.getUserEngagementData()).thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/reports/user-engagement"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].username").value("user1"))
                .andExpect(jsonPath("$.data[0].email").value("user1@example.com"))
                .andExpect(jsonPath("$.data[0].totalBooks").value(10))
                .andExpect(jsonPath("$.data[0].booksRead").value(8));

        verify(adminService).getUserEngagementData();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void exportBooksByCategoryReport_PDF_Success() throws Exception {
        // Arrange
        byte[] reportData = "PDF content".getBytes();
        when(adminService.exportBooksByCategoryReport("pdf")).thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/reports/books-by-category/export")
                .param("format", "pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "form-data; name=\"attachment\"; filename=\"books_by_category_report.pdf\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        verify(adminService).exportBooksByCategoryReport("pdf");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void exportBooksByCategoryReport_Excel_Success() throws Exception {
        // Arrange
        byte[] reportData = "Excel content".getBytes();
        when(adminService.exportBooksByCategoryReport("excel")).thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/reports/books-by-category/export")
                .param("format", "excel"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "form-data; name=\"attachment\"; filename=\"books_by_category_report.excel\""));

        verify(adminService).exportBooksByCategoryReport("excel");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getPopularityStatistics_Success() throws Exception {
        // Arrange
        List<PopularityStatisticsData> statisticsData = Arrays.asList(
            new PopularityStatisticsData(1L, "Popular Book", "Popular Author", 100L, 50.0, 1),
            new PopularityStatisticsData(2L, "Another Book", "Another Author", 50L, 25.0, 2)
        );
        when(adminService.getPopularityStatisticsData()).thenReturn(statisticsData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/popularity/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Popular Book"))
                .andExpect(jsonPath("$.data[0].author").value("Popular Author"))
                .andExpect(jsonPath("$.data[0].viewCount").value(100))
                .andExpect(jsonPath("$.data[0].percentage").value(50.0))
                .andExpect(jsonPath("$.data[0].rank").value(1));

        verify(adminService).getPopularityStatisticsData();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getPopularityStatistics_EmptyData() throws Exception {
        // Arrange
        when(adminService.getPopularityStatisticsData()).thenReturn(Arrays.asList());

        // Act & Assert
        mockMvc.perform(get("/api/admin/popularity/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data").isEmpty())
                .andExpect(jsonPath("$.message").value("No popularity data available. Books need to be viewed to generate statistics."));

        verify(adminService).getPopularityStatisticsData();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getPopularityStatistics_ServiceException() throws Exception {
        // Arrange
        when(adminService.getPopularityStatisticsData()).thenThrow(new RuntimeException("Database error"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/popularity/statistics"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Failed to retrieve popularity statistics: Database error"));

        verify(adminService).getPopularityStatisticsData();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void exportPopularityStatistics_PDF_Success() throws Exception {
        // Arrange
        byte[] reportData = "PDF content".getBytes();
        when(adminService.exportPopularityStatisticsReport("pdf")).thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/popularity/export")
                .param("format", "pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "form-data; name=\"attachment\"; filename=\"popularity_statistics_report.pdf\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));

        verify(adminService).exportPopularityStatisticsReport("pdf");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void exportPopularityStatistics_CSV_Success() throws Exception {
        // Arrange
        byte[] reportData = "CSV content".getBytes();
        when(adminService.exportPopularityStatisticsReport("csv")).thenReturn(reportData);

        // Act & Assert
        mockMvc.perform(get("/api/admin/popularity/export")
                .param("format", "csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "form-data; name=\"attachment\"; filename=\"popularity_statistics_report.csv\""))
                .andExpect(content().contentType(MediaType.parseMediaType("text/csv")));

        verify(adminService).exportPopularityStatisticsReport("csv");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void exportPopularityStatistics_InvalidFormat() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/admin/popularity/export")
                .param("format", "xml"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Invalid format. Supported formats: csv, pdf"));

        verify(adminService, never()).exportPopularityStatisticsReport(anyString());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void exportPopularityStatistics_JRException() throws Exception {
        // Arrange
        when(adminService.exportPopularityStatisticsReport("pdf"))
            .thenThrow(new net.sf.jasperreports.engine.JRException("Report generation failed"));

        // Act & Assert
        mockMvc.perform(get("/api/admin/popularity/export")
                .param("format", "pdf"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Error generating report: Report generation failed"));

        verify(adminService).exportPopularityStatisticsReport("pdf");
    }
}