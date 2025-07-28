package com.booktracker.controller;

import com.booktracker.dto.FriendRequestRequest;
import com.booktracker.dto.FriendRequestResponse;
import com.booktracker.dto.FriendshipResponse;
import com.booktracker.entity.User;
import com.booktracker.security.JwtUtil;
import com.booktracker.service.FriendshipService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FriendshipController.class)
class FriendshipControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private FriendshipService friendshipService;
    
    @MockBean
    private JwtUtil jwtUtil;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private String validToken;
    private User user1;
    private User user2;
    private FriendshipResponse friendshipResponse;
    
    @BeforeEach
    void setUp() {
        validToken = "Bearer valid-jwt-token";
        
        user1 = new User();
        user1.setId(1L);
        user1.setUsername("user1");
        user1.setEmail("user1@example.com");
        
        user2 = new User();
        user2.setId(2L);
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");
        
        friendshipResponse = new FriendshipResponse();
        friendshipResponse.setId(1L);
        friendshipResponse.setStatus("pending");
        
        // Mock JWT token extraction
        when(jwtUtil.extractUsername("valid-jwt-token")).thenReturn("user1");
        when(jwtUtil.extractUserId("valid-jwt-token")).thenReturn(1L);
    }
    
    @Test
    void getFriends_Success() throws Exception {
        // Given
        List<User> friends = Arrays.asList(user2);
        when(friendshipService.getFriends(1L)).thenReturn(friends);
        when(friendshipService.getFriendCount(1L)).thenReturn(1L);
        
        // When & Then
        mockMvc.perform(get("/api/friends")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.friends").isArray())
                .andExpect(jsonPath("$.totalCount").value(1));
    }
    
    @Test
    void sendFriendRequest_Success() throws Exception {
        // Given
        FriendRequestRequest request = new FriendRequestRequest(2L);
        when(friendshipService.sendFriendRequest(1L, 2L)).thenReturn(friendshipResponse);
        
        // When & Then
        mockMvc.perform(post("/api/friends/request")
                .header("Authorization", validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Friend request sent successfully"))
                .andExpect(jsonPath("$.friendship.id").value(1));
    }
    
    @Test
    void sendFriendRequest_InvalidRequest() throws Exception {
        // Given
        FriendRequestRequest request = new FriendRequestRequest(); // Missing friendId
        
        // When & Then
        mockMvc.perform(post("/api/friends/request")
                .header("Authorization", validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
    
    @Test
    void acceptFriendRequest_Success() throws Exception {
        // Given
        FriendRequestResponse request = new FriendRequestResponse("accept");
        when(friendshipService.acceptFriendRequest(1L, 1L)).thenReturn(friendshipResponse);
        
        // When & Then
        mockMvc.perform(put("/api/friends/request/1")
                .header("Authorization", validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Friend request accepted"));
    }
    
    @Test
    void declineFriendRequest_Success() throws Exception {
        // Given
        FriendRequestResponse request = new FriendRequestResponse("decline");
        
        // When & Then
        mockMvc.perform(put("/api/friends/request/1")
                .header("Authorization", validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Friend request declined"));
    }
    
    @Test
    void respondToFriendRequest_InvalidAction() throws Exception {
        // Given
        FriendRequestResponse request = new FriendRequestResponse("invalid");
        
        // When & Then
        mockMvc.perform(put("/api/friends/request/1")
                .header("Authorization", validToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error").value("Invalid action. Use 'accept' or 'decline'"));
    }
    
    @Test
    void removeFriend_Success() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/friends/2")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Friend removed successfully"));
    }
    
    @Test
    void getSentFriendRequests_Success() throws Exception {
        // Given
        List<FriendshipResponse> sentRequests = Arrays.asList(friendshipResponse);
        when(friendshipService.getSentFriendRequests(1L)).thenReturn(sentRequests);
        
        // When & Then
        mockMvc.perform(get("/api/friends/requests/sent")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.sentRequests").isArray())
                .andExpect(jsonPath("$.count").value(1));
    }
    
    @Test
    void getReceivedFriendRequests_Success() throws Exception {
        // Given
        List<FriendshipResponse> receivedRequests = Arrays.asList(friendshipResponse);
        when(friendshipService.getReceivedFriendRequests(1L)).thenReturn(receivedRequests);
        when(friendshipService.getPendingRequestCount(1L)).thenReturn(1L);
        
        // When & Then
        mockMvc.perform(get("/api/friends/requests/received")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.receivedRequests").isArray())
                .andExpect(jsonPath("$.pendingCount").value(1));
    }
    
    @Test
    void checkFriendship_Success() throws Exception {
        // Given
        when(friendshipService.areFriends(1L, 2L)).thenReturn(true);
        
        // When & Then
        mockMvc.perform(get("/api/friends/check/2")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.areFriends").value(true));
    }
    
    @Test
    void getMutualFriends_Success() throws Exception {
        // Given
        List<User> mutualFriends = Arrays.asList(user2);
        when(friendshipService.getMutualFriends(1L, 2L)).thenReturn(mutualFriends);
        
        // When & Then
        mockMvc.perform(get("/api/friends/mutual/2")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.mutualFriends").isArray())
                .andExpect(jsonPath("$.count").value(1));
    }
    
    @Test
    void getFriendshipStats_Success() throws Exception {
        // Given
        when(friendshipService.getFriendCount(1L)).thenReturn(5L);
        when(friendshipService.getPendingRequestCount(1L)).thenReturn(2L);
        
        // When & Then
        mockMvc.perform(get("/api/friends/stats")
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.stats.friendCount").value(5))
                .andExpect(jsonPath("$.stats.pendingRequestCount").value(2));
    }
}