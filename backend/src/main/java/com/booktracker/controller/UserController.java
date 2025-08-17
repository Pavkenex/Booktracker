package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.service.AuthService;
import com.booktracker.service.UserService;
import com.booktracker.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthService authService;

    @Autowired
    private SecurityUtils securityUtils;

    /**
     * Get current user profile
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        try {
            Long userId = securityUtils.getCurrentUserId();
            UserProfileResponse response = userService.getUserProfile(userId);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new UserProfileResponse(false, "Unauthorized access"));
        }
    }

    /**
     * Get user profile by ID
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        UserProfileResponse response = userService.getUserProfile(userId);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get user profile by username
     */
    @GetMapping("/username/{username}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserProfileByUsername(@PathVariable String username) {
        UserProfileResponse response = userService.getUserProfileByUsername(username);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Update current user profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        try {
            Long userId = securityUtils.getCurrentUserId();
            UserProfileResponse response = userService.updateUserProfile(userId, request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new UserProfileResponse(false, "Unauthorized access"));
        }
    }

    /**
     * Change current user password
     */
    @PutMapping("/password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        try {
            Long userId = securityUtils.getCurrentUserId();
            AuthResponse response = userService.changePassword(userId, request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Unauthorized access"));
        }
    }

    /**
     * Delete current user account
     */
    @DeleteMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> deleteCurrentUser() {
        try {
            Long userId = securityUtils.getCurrentUserId();
            AuthResponse response = userService.deleteUser(userId);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(false, "Unauthorized access"));
        }
    }

    /**
     * Get all users (admin only)
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserProfileResponse.UserInfo>> getAllUsers() {
        try {
            List<UserProfileResponse.UserInfo> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Delete user by ID (admin only)
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuthResponse> deleteUser(@PathVariable Long userId) {
        AuthResponse response = userService.deleteUser(userId);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Check if username exists
     */
    @GetMapping("/check/username/{username}")
    public ResponseEntity<Boolean> checkUsernameExists(@PathVariable String username) {
        boolean exists = userService.usernameExists(username);
        return ResponseEntity.ok(exists);
    }

    /**
     * Check if email exists
     */
    @GetMapping("/check/email/{email}")
    public ResponseEntity<Boolean> checkEmailExists(@PathVariable String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(exists);
    }
}