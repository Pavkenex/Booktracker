package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Get user profile by ID
     */
    public UserProfileResponse getUserProfile(Long userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return new UserProfileResponse(false, "User not found");
            }
            
            User user = userOptional.get();
            UserProfileResponse.UserInfo userInfo = new UserProfileResponse.UserInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getCreatedAt(),
                    user.getIsAdmin()
            );
            
            return new UserProfileResponse(true, "User profile retrieved successfully", userInfo);
            
        } catch (Exception e) {
            return new UserProfileResponse(false, "Failed to retrieve user profile: " + e.getMessage());
        }
    }

    /**
     * Get user profile by username
     */
    public UserProfileResponse getUserProfileByUsername(String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return new UserProfileResponse(false, "User not found");
            }
            
            User user = userOptional.get();
            UserProfileResponse.UserInfo userInfo = new UserProfileResponse.UserInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getCreatedAt(),
                    user.getIsAdmin()
            );
            
            return new UserProfileResponse(true, "User profile retrieved successfully", userInfo);
            
        } catch (Exception e) {
            return new UserProfileResponse(false, "Failed to retrieve user profile: " + e.getMessage());
        }
    }

    /**
     * Update user profile
     */
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return new UserProfileResponse(false, "User not found");
            }
            
            User user = userOptional.get();
            
            // Check if new username is already taken by another user
            if (!user.getUsername().equals(request.getUsername()) && 
                userRepository.existsByUsername(request.getUsername())) {
                return new UserProfileResponse(false, "Username is already taken");
            }
            
            // Check if new email is already taken by another user
            if (!user.getEmail().equals(request.getEmail()) && 
                userRepository.existsByEmail(request.getEmail())) {
                return new UserProfileResponse(false, "Email is already registered");
            }
            
            // Update user information
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            
            User updatedUser = userRepository.save(user);
            
            UserProfileResponse.UserInfo userInfo = new UserProfileResponse.UserInfo(
                    updatedUser.getId(),
                    updatedUser.getUsername(),
                    updatedUser.getEmail(),
                    updatedUser.getCreatedAt(),
                    updatedUser.getIsAdmin()
            );
            
            return new UserProfileResponse(true, "Profile updated successfully", userInfo);
            
        } catch (Exception e) {
            return new UserProfileResponse(false, "Failed to update profile: " + e.getMessage());
        }
    }

    /**
     * Change user password
     */
    public AuthResponse changePassword(Long userId, ChangePasswordRequest request) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return new AuthResponse(false, "User not found");
            }
            
            User user = userOptional.get();
            
            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return new AuthResponse(false, "Current password is incorrect");
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            return new AuthResponse(true, "Password changed successfully");
            
        } catch (Exception e) {
            return new AuthResponse(false, "Failed to change password: " + e.getMessage());
        }
    }

    /**
     * Delete user account
     */
    public AuthResponse deleteUser(Long userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return new AuthResponse(false, "User not found");
            }
            
            userRepository.deleteById(userId);
            
            return new AuthResponse(true, "User account deleted successfully");
            
        } catch (Exception e) {
            return new AuthResponse(false, "Failed to delete user account: " + e.getMessage());
        }
    }

    /**
     * Get all users (admin only)
     */
    public List<UserDto> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            
            return users.stream()
                    .map(UserDto::new)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            throw new RuntimeException("Failed to retrieve users: " + e.getMessage());
        }
    }

    /**
     * Check if user exists by ID
     */
    public boolean userExists(Long userId) {
        return userRepository.existsById(userId);
    }

    /**
     * Check if username exists
     */
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    /**
     * Check if email exists
     */
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Get user by username (for internal use)
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Get user by email (for internal use)
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get user by ID (for internal use)
     */
    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }
}