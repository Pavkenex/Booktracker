package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setIsAdmin(false);
    }

    @Test
    void getUserProfile_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When
        UserProfileResponse response = userService.getUserProfile(1L);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("User profile retrieved successfully", response.getMessage());
        assertNotNull(response.getUser());
        assertEquals("testuser", response.getUser().getUsername());
        assertEquals("test@example.com", response.getUser().getEmail());
    }

    @Test
    void getUserProfile_UserNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        UserProfileResponse response = userService.getUserProfile(1L);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("User not found", response.getMessage());
        assertNull(response.getUser());
    }

    @Test
    void getUserProfileByUsername_Success() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // When
        UserProfileResponse response = userService.getUserProfileByUsername("testuser");

        // Then
        assertTrue(response.isSuccess());
        assertEquals("User profile retrieved successfully", response.getMessage());
        assertNotNull(response.getUser());
        assertEquals("testuser", response.getUser().getUsername());
    }

    @Test
    void updateUserProfile_Success() {
        // Given
        UpdateProfileRequest request = new UpdateProfileRequest("newusername", "newemail@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("newusername")).thenReturn(false);
        when(userRepository.existsByEmail("newemail@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        UserProfileResponse response = userService.updateUserProfile(1L, request);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("Profile updated successfully", response.getMessage());
        verify(userRepository).save(testUser);
    }

    @Test
    void updateUserProfile_UsernameAlreadyTaken() {
        // Given
        UpdateProfileRequest request = new UpdateProfileRequest("existinguser", "newemail@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // When
        UserProfileResponse response = userService.updateUserProfile(1L, request);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("Username is already taken", response.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateUserProfile_EmailAlreadyTaken() {
        // Given
        UpdateProfileRequest request = new UpdateProfileRequest("newusername", "existing@example.com");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.existsByUsername("newusername")).thenReturn(false);
        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // When
        UserProfileResponse response = userService.updateUserProfile(1L, request);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("Email is already registered", response.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changePassword_Success() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest("currentPassword", "newPassword");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("currentPassword", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        AuthResponse response = userService.changePassword(1L, request);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("Password changed successfully", response.getMessage());
        verify(userRepository).save(testUser);
    }

    @Test
    void changePassword_IncorrectCurrentPassword() {
        // Given
        ChangePasswordRequest request = new ChangePasswordRequest("wrongPassword", "newPassword");
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        // When
        AuthResponse response = userService.changePassword(1L, request);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("Current password is incorrect", response.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deleteUser_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // When
        AuthResponse response = userService.deleteUser(1L);

        // Then
        assertTrue(response.isSuccess());
        assertEquals("User account deleted successfully", response.getMessage());
        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_UserNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        AuthResponse response = userService.deleteUser(1L);

        // Then
        assertFalse(response.isSuccess());
        assertEquals("User not found", response.getMessage());
        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void getAllUsers_Success() {
        // Given
        User user2 = new User();
        user2.setId(2L);
        user2.setUsername("user2");
        user2.setEmail("user2@example.com");
        user2.setCreatedAt(LocalDateTime.now());
        user2.setIsAdmin(true);

        List<User> users = Arrays.asList(testUser, user2);
        when(userRepository.findAll()).thenReturn(users);

        // When
        List<UserProfileResponse.UserInfo> result = userService.getAllUsers();

        // Then
        assertEquals(2, result.size());
        assertEquals("testuser", result.get(0).getUsername());
        assertEquals("user2", result.get(1).getUsername());
        assertFalse(result.get(0).getIsAdmin());
        assertTrue(result.get(1).getIsAdmin());
    }

    @Test
    void userExists_True() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(true);

        // When
        boolean exists = userService.userExists(1L);

        // Then
        assertTrue(exists);
    }

    @Test
    void userExists_False() {
        // Given
        when(userRepository.existsById(1L)).thenReturn(false);

        // When
        boolean exists = userService.userExists(1L);

        // Then
        assertFalse(exists);
    }

    @Test
    void usernameExists_True() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // When
        boolean exists = userService.usernameExists("testuser");

        // Then
        assertTrue(exists);
    }

    @Test
    void emailExists_True() {
        // Given
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When
        boolean exists = userService.emailExists("test@example.com");

        // Then
        assertTrue(exists);
    }
}