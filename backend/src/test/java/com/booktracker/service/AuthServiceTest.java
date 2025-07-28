package com.booktracker.service;

import com.booktracker.dto.AuthResponse;
import com.booktracker.dto.LoginRequest;
import com.booktracker.dto.RegisterRequest;
import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import com.booktracker.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setIsAdmin(false);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "password123");
        
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtUtil.generateToken(anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertTrue(response.isSuccess());
        assertEquals("User registered successfully", response.getMessage());
        assertNotNull(response.getToken());
        assertNotNull(response.getUser());
    }

    @Test
    void testRegisterUsernameExists() {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "password123");
        
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        AuthResponse response = authService.register(request);

        assertFalse(response.isSuccess());
        assertEquals("Username is already taken", response.getMessage());
    }

    @Test
    void testRegisterEmailExists() {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "password123");
        
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        AuthResponse response = authService.register(request);

        assertFalse(response.isSuccess());
        assertEquals("Email is already registered", response.getMessage());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("testuser", "password123");
        
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(userRepository.findByUsernameOrEmail(anyString())).thenReturn(Optional.of(testUser));
        when(jwtUtil.generateToken(anyString())).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertTrue(response.isSuccess());
        assertEquals("Login successful", response.getMessage());
        assertNotNull(response.getToken());
        assertNotNull(response.getUser());
    }

    @Test
    void testValidateToken() {
        String token = "valid-token";
        when(jwtUtil.isTokenValid(token)).thenReturn(true);

        boolean isValid = authService.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void testGetUsernameFromToken() {
        String token = "valid-token";
        String expectedUsername = "testuser";
        when(jwtUtil.extractUsername(token)).thenReturn(expectedUsername);

        String username = authService.getUsernameFromToken(token);

        assertEquals(expectedUsername, username);
    }
}