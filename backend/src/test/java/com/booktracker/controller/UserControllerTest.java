package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.service.AuthService;
import com.booktracker.service.UserService;
import com.booktracker.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private AuthService authService;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserController userController;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private UpdateProfileRequest updateProfileRequest;
    private ChangePasswordRequest changePasswordRequest;
    private AuthResponse authResponse;
    private UserProfileResponse userProfileResponse;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("testuser", "test@example.com", "password123");
        loginRequest = new LoginRequest("testuser", "password123");
        updateProfileRequest = new UpdateProfileRequest("newusername", "newemail@example.com");
        changePasswordRequest = new ChangePasswordRequest("oldPassword", "newPassword");
        
        authResponse = new AuthResponse(true, "Success", "token", 
                new AuthResponse.UserInfo(1L, "testuser", "test@example.com", false));
        
        UserProfileResponse.UserInfo userInfo = new UserProfileResponse.UserInfo(
                1L, "testuser", "test@example.com", LocalDateTime.now(), false);
        userProfileResponse = new UserProfileResponse(true, "Success", userInfo);
    }

    @Test
    void registerUser_Success() {
        // Given
        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        // When
        ResponseEntity<AuthResponse> response = userController.registerUser(registerRequest);

        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Success", response.getBody().getMessage());
        assertEquals("token", response.getBody().getToken());
        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void registerUser_Failure() {
        // Given
        AuthResponse failureResponse = new AuthResponse(false, "Registration failed");
        when(authService.register(any(RegisterRequest.class))).thenReturn(failureResponse);

        // When
        ResponseEntity<AuthResponse> response = userController.registerUser(registerRequest);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Registration failed", response.getBody().getMessage());
    }

    @Test
    void loginUser_Success() {
        // Given
        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        // When
        ResponseEntity<AuthResponse> response = userController.loginUser(loginRequest);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("token", response.getBody().getToken());
        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void loginUser_InvalidCredentials() {
        // Given
        AuthResponse failureResponse = new AuthResponse(false, "Invalid credentials");
        when(authService.login(any(LoginRequest.class))).thenReturn(failureResponse);

        // When
        ResponseEntity<AuthResponse> response = userController.loginUser(loginRequest);

        // Then
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Invalid credentials", response.getBody().getMessage());
    }

    @Test
    void getCurrentUserProfile_Success() {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        
        when(jwtUtil.extractUsername("token")).thenReturn("testuser");
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(createTestUser()));
        when(userService.getUserProfile(1L)).thenReturn(userProfileResponse);

        // When
        ResponseEntity<UserProfileResponse> response = userController.getCurrentUserProfile(request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("testuser", response.getBody().getUser().getUsername());
    }

    @Test
    void getUserProfile_Success() {
        // Given
        when(userService.getUserProfile(1L)).thenReturn(userProfileResponse);

        // When
        ResponseEntity<UserProfileResponse> response = userController.getUserProfile(1L);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("testuser", response.getBody().getUser().getUsername());
        verify(userService).getUserProfile(1L);
    }

    @Test
    void getUserProfileByUsername_Success() {
        // Given
        when(userService.getUserProfileByUsername("testuser")).thenReturn(userProfileResponse);

        // When
        ResponseEntity<UserProfileResponse> response = userController.getUserProfileByUsername("testuser");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("testuser", response.getBody().getUser().getUsername());
        verify(userService).getUserProfileByUsername("testuser");
    }

    @Test
    void updateUserProfile_Success() {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        
        when(jwtUtil.extractUsername("token")).thenReturn("testuser");
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(createTestUser()));
        when(userService.updateUserProfile(eq(1L), any(UpdateProfileRequest.class))).thenReturn(userProfileResponse);

        // When
        ResponseEntity<UserProfileResponse> response = userController.updateUserProfile(updateProfileRequest, request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        verify(userService).updateUserProfile(eq(1L), any(UpdateProfileRequest.class));
    }

    @Test
    void changePassword_Success() {
        // Given
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        
        when(jwtUtil.extractUsername("token")).thenReturn("testuser");
        when(userService.findByUsername("testuser")).thenReturn(Optional.of(createTestUser()));
        when(userService.changePassword(eq(1L), any(ChangePasswordRequest.class)))
                .thenReturn(new AuthResponse(true, "Password changed successfully"));

        // When
        ResponseEntity<AuthResponse> response = userController.changePassword(changePasswordRequest, request);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Password changed successfully", response.getBody().getMessage());
        verify(userService).changePassword(eq(1L), any(ChangePasswordRequest.class));
    }

    @Test
    void getAllUsers_Success() {
        // Given
        List<UserProfileResponse.UserInfo> users = Arrays.asList(
                new UserProfileResponse.UserInfo(1L, "user1", "user1@example.com", LocalDateTime.now(), false),
                new UserProfileResponse.UserInfo(2L, "user2", "user2@example.com", LocalDateTime.now(), true)
        );
        when(userService.getAllUsers()).thenReturn(users);

        // When
        ResponseEntity<List<UserProfileResponse.UserInfo>> response = userController.getAllUsers();

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        assertEquals("user1", response.getBody().get(0).getUsername());
        assertEquals("user2", response.getBody().get(1).getUsername());
        verify(userService).getAllUsers();
    }

    @Test
    void deleteUser_Success() {
        // Given
        when(userService.deleteUser(1L)).thenReturn(new AuthResponse(true, "User deleted successfully"));

        // When
        ResponseEntity<AuthResponse> response = userController.deleteUser(1L);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("User deleted successfully", response.getBody().getMessage());
        verify(userService).deleteUser(1L);
    }

    @Test
    void checkUsernameExists_True() {
        // Given
        when(userService.usernameExists("testuser")).thenReturn(true);

        // When
        ResponseEntity<Boolean> response = userController.checkUsernameExists("testuser");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody());
        verify(userService).usernameExists("testuser");
    }

    @Test
    void checkEmailExists_False() {
        // Given
        when(userService.emailExists("test@example.com")).thenReturn(false);

        // When
        ResponseEntity<Boolean> response = userController.checkEmailExists("test@example.com");

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody());
        verify(userService).emailExists("test@example.com");
    }

    private com.booktracker.entity.User createTestUser() {
        com.booktracker.entity.User user = new com.booktracker.entity.User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setIsAdmin(false);
        return user;
    }
}