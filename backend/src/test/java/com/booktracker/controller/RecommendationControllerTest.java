package com.booktracker.controller;

import com.booktracker.dto.RecommendationRequest;
import com.booktracker.dto.RecommendationResponse;
import com.booktracker.security.JwtUtil;
import com.booktracker.service.RecommendationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RecommendationController.class)
class RecommendationControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private RecommendationService recommendationService;
    
    @MockBean
    private JwtUtil jwtUtil;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String validToken;
    private RecommendationResponse recommendationResponse;
    
    @BeforeEach
    void setUp() {
        validToken = "Bearer valid-jwt-token";
        
        recommendationResponse = new RecommendationResponse();
        recommendationResponse.setId(1L);
        recommendationResponse.setMessage("Great book!");
        recommendationResponse.setCreatedAt(LocalDateTime.now());
        
        // Mock JWT token extraction
        when(jwtUtil.extractUsername("valid-jwt-token")).thenReturn("user1");
        when(jwtUtil.extractUserId("valid-jwt-token")).thenReturn(1L);
    }
    
    @Test
    void sendRecommendation_Success() throws Exception {
        // Given
        RecommendationRequest request = new RecommendationRequest(2L, 1L, "Great book!");
        when(recommendationService.sendRecommendation(1L, 2L, 1L, "Great book!"))
                .thenReturn(recommendationResponse);
        
        // When & Then
        mockMvc.perform(post("/api/recommendations")
                .header("Authorization", validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Recommendation sent successfully"))
                .andExpect(jsonPath("$.recommendation.id").value(1));
    }
    
    @Test
    void sendRecommendation_InvalidRequest() throws Exception {
        // Given
        RecommendationRequest request = new RecommendationRequest(); // Missing required fields
        
        // When & Then
        mockMvc.perform(post("/api/recommendations")
                .header("Authorization", validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void getSentRecommendations_Success() throws Exception {
        // Given
        List<RecommendationResponse> recommendations = Arrays.asList(recommendationResponse);
        when(recommendationService.getSentRecommendations(1L, 0, 10)).thenReturn(recommendations);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/sent")
                .header("Authorization", validToken)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.recommendations").isArray())
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
    }
    
    @Test
    void getSentRecommendations_DefaultParams() throws Exception {
        // Given
        List<RecommendationResponse> recommendations = Arrays.asList(recommendationResponse);
        when(recommendationService.getSentRecommendations(1L, 0, 10)).thenReturn(recommendations);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/sent")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10));
    }
    
    @Test
    void getReceivedRecommendations_Success() throws Exception {
        // Given
        List<RecommendationResponse> recommendations = Arrays.asList(recommendationResponse);
        when(recommendationService.getReceivedRecommendations(1L, 0, 10)).thenReturn(recommendations);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/received")
                .header("Authorization", validToken)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.recommendations").isArray());
    }
    
    @Test
    void getRecommendationsBetweenUsers_Success() throws Exception {
        // Given
        List<RecommendationResponse> recommendations = Arrays.asList(recommendationResponse);
        when(recommendationService.getRecommendationsBetweenUsers(1L, 2L, 0, 10))
                .thenReturn(recommendations);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/between/2")
                .header("Authorization", validToken)
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.recommendations").isArray());
    }
    
    @Test
    void getRecentRecommendations_Success() throws Exception {
        // Given
        List<RecommendationResponse> recommendations = Arrays.asList(recommendationResponse);
        when(recommendationService.getRecentRecommendations(1L, 5)).thenReturn(recommendations);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/recent")
                .header("Authorization", validToken)
                .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.recommendations").isArray())
                .andExpect(jsonPath("$.limit").value(5));
    }
    
    @Test
    void getRecentRecommendations_DefaultLimit() throws Exception {
        // Given
        List<RecommendationResponse> recommendations = Arrays.asList(recommendationResponse);
        when(recommendationService.getRecentRecommendations(1L, 5)).thenReturn(recommendations);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/recent")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.limit").value(5));
    }
    
    @Test
    void getRecommendationsForBook_Success() throws Exception {
        // Given
        List<RecommendationResponse> recommendations = Arrays.asList(recommendationResponse);
        when(recommendationService.getRecommendationsForBook(1L)).thenReturn(recommendations);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/book/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.recommendations").isArray())
                .andExpect(jsonPath("$.count").value(1));
    }
    
    @Test
    void deleteRecommendation_Success() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/recommendations/1")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Recommendation deleted successfully"));
    }
    
    @Test
    void getRecommendationStats_Success() throws Exception {
        // Given
        RecommendationService.RecommendationStats stats = 
                new RecommendationService.RecommendationStats(5L, 3L);
        when(recommendationService.getRecommendationStats(1L)).thenReturn(stats);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/stats")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.stats.sentCount").value(5))
                .andExpect(jsonPath("$.stats.receivedCount").value(3));
    }
    
    @Test
    void checkRecommendation_Success() throws Exception {
        // Given
        when(recommendationService.hasRecommended(1L, 2L, 1L)).thenReturn(true);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/check")
                .header("Authorization", validToken)
                .param("receiverId", "2")
                .param("bookId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.hasRecommended").value(true));
    }
    
    @Test
    void getMostRecommendedBooks_Success() throws Exception {
        // Given
        Object[] bookData = {"Book Title", 5L};
        List<Object[]> mostRecommended = Collections.singletonList(bookData);
        when(recommendationService.getMostRecommendedBooks(10)).thenReturn(mostRecommended);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/popular")
                .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.mostRecommended").isArray())
                .andExpect(jsonPath("$.limit").value(10));
    }
    
    @Test
    void getMostRecommendedBooks_DefaultLimit() throws Exception {
        // Given
        Object[] bookData = {"Book Title", 5L};
        List<Object[]> mostRecommended = Collections.singletonList(bookData);
        when(recommendationService.getMostRecommendedBooks(10)).thenReturn(mostRecommended);
        
        // When & Then
        mockMvc.perform(get("/api/recommendations/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.limit").value(10));
    }
}