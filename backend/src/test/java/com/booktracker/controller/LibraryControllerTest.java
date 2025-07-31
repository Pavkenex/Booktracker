package com.booktracker.controller;

import com.booktracker.dto.LibraryStatsResponse;
import com.booktracker.dto.UserBookRequest;
import com.booktracker.dto.UserBookResponse;
import com.booktracker.entity.UserBook;
import com.booktracker.service.LibraryService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LibraryController.class)
class LibraryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LibraryService libraryService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserBookRequest userBookRequest;
    private UserBookResponse userBookResponse;

    @BeforeEach
    void setUp() {
        userBookRequest = new UserBookRequest();
        userBookRequest.setBookId(1L);
        userBookRequest.setStatus(UserBook.ReadingStatus.to_read);
        userBookRequest.setIsFavourite(false);

        userBookResponse = new UserBookResponse();
        userBookResponse.setId(1L);
        userBookResponse.setStatus(UserBook.ReadingStatus.to_read);
        userBookResponse.setIsFavourite(false);
    }

    @Test
    @WithMockUser(username = "testuser")
    void addBookToLibrary_Success() throws Exception {
        // Arrange
        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.addBookToLibrary(eq(1L), any(UserBookRequest.class))).thenReturn(userBookResponse);

        // Act & Assert
        mockMvc.perform(post("/api/library/books")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userBookRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Book added to library successfully"))
                .andExpect(jsonPath("$.data.id").value(1L));

        verify(libraryService).addBookToLibrary(eq(1L), any(UserBookRequest.class));
    }

    @Test
    @WithMockUser(username = "testuser")
    void addBookToLibrary_BookAlreadyExists() throws Exception {
        // Arrange
        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.addBookToLibrary(eq(1L), any(UserBookRequest.class)))
                .thenThrow(new RuntimeException("Book already exists in your library"));

        // Act & Assert
        mockMvc.perform(post("/api/library/books")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userBookRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Book already exists in your library"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void updateBookInLibrary_Success() throws Exception {
        // Arrange
        userBookRequest.setStatus(UserBook.ReadingStatus.read);
        userBookRequest.setRating(5);
        userBookRequest.setReview("Great book!");

        userBookResponse.setStatus(UserBook.ReadingStatus.read);
        userBookResponse.setRating(5);
        userBookResponse.setReview("Great book!");

        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.updateBookInLibrary(eq(1L), eq(1L), any(UserBookRequest.class)))
                .thenReturn(userBookResponse);

        // Act & Assert
        mockMvc.perform(put("/api/library/books/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userBookRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Book updated successfully"))
                .andExpect(jsonPath("$.data.status").value("read"))
                .andExpect(jsonPath("$.data.rating").value(5));
    }

    @Test
    @WithMockUser(username = "testuser")
    void removeBookFromLibrary_Success() throws Exception {
        // Arrange
        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        doNothing().when(libraryService).removeBookFromLibrary(1L, 1L);

        // Act & Assert
        mockMvc.perform(delete("/api/library/books/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Book removed from library successfully"));

        verify(libraryService).removeBookFromLibrary(1L, 1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void getUserLibrary_Success() throws Exception {
        // Arrange
        List<UserBookResponse> books = Arrays.asList(userBookResponse);
        Page<UserBookResponse> page = new PageImpl<>(books);

        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.getUserLibrary(eq(1L), eq(0), eq(10), eq("id"), eq("desc")))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/library")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "id")
                .param("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getUserLibraryByStatus_Success() throws Exception {
        // Arrange
        List<UserBookResponse> books = Arrays.asList(userBookResponse);
        Page<UserBookResponse> page = new PageImpl<>(books);

        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.getUserLibraryByStatus(eq(1L), eq(UserBook.ReadingStatus.to_read), 
                eq(0), eq(10), eq("id"), eq("desc")))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/library/status/to_read")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "id")
                .param("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].status").value("to_read"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getUserFavoriteBooks_Success() throws Exception {
        // Arrange
        userBookResponse.setIsFavourite(true);
        List<UserBookResponse> books = Arrays.asList(userBookResponse);
        Page<UserBookResponse> page = new PageImpl<>(books);

        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.getUserFavoriteBooks(eq(1L), eq(0), eq(10), eq("id"), eq("desc")))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/library/favorites")
                .param("page", "0")
                .param("size", "10")
                .param("sortBy", "id")
                .param("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].isFavourite").value(true));
    }

    @Test
    @WithMockUser(username = "testuser")
    void toggleFavorite_Success() throws Exception {
        // Arrange
        userBookResponse.setIsFavourite(true);
        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.toggleFavorite(1L, 1L)).thenReturn(userBookResponse);

        // Act & Assert
        mockMvc.perform(put("/api/library/books/1/favorite")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Favorite status updated successfully"))
                .andExpect(jsonPath("$.data.isFavourite").value(true));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getLibraryStats_Success() throws Exception {
        // Arrange
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        ratingDistribution.put(5, 3L);
        ratingDistribution.put(4, 2L);

        LibraryStatsResponse stats = new LibraryStatsResponse(10L, 6L, 2L, 4L, 3L, ratingDistribution, 4.5);

        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.getLibraryStats(1L)).thenReturn(stats);

        // Act & Assert
        mockMvc.perform(get("/api/library/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalBooks").value(10))
                .andExpect(jsonPath("$.data.booksRead").value(6))
                .andExpect(jsonPath("$.data.booksToRead").value(4))
                .andExpect(jsonPath("$.data.favoriteBooks").value(3))
                .andExpect(jsonPath("$.data.averageRating").value(4.5));
    }

    @Test
    @WithMockUser(username = "testuser")
    void checkBookInLibrary_Success() throws Exception {
        // Arrange
        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.hasBookInLibrary(1L, 1L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/library/books/check/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.hasBook").value(true));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getRecentActivity_Success() throws Exception {
        // Arrange
        List<UserBookResponse> recentBooks = Arrays.asList(userBookResponse);

        when(libraryService.getUserIdByUsername("testuser")).thenReturn(1L);
        when(libraryService.getRecentActivity(1L, 10)).thenReturn(recentBooks);

        // Act & Assert
        mockMvc.perform(get("/api/library/recent")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].id").value(1L));
    }

    @Test
    void addBookToLibrary_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(post("/api/library/books")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userBookRequest)))
                .andExpect(status().isUnauthorized());
    }
}