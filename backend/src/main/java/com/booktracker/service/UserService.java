package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AvatarStorageService avatarStorageService;

    public UserService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      AvatarStorageService avatarStorageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.avatarStorageService = avatarStorageService;
    }

    
    public UserProfileResponse getUserProfile(Long userId) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return new UserProfileResponse(false, "User not found");
            }

            User user = userOptional.get();
            return buildProfileResponse(user, "User profile retrieved successfully");

        } catch (Exception e) {
            return new UserProfileResponse(false, "Failed to retrieve user profile: " + e.getMessage());
        }
    }

    
    public UserProfileResponse getUserProfileByUsername(String username) {
        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (userOptional.isEmpty()) {
                return new UserProfileResponse(false, "User not found");
            }

            User user = userOptional.get();
            return buildProfileResponse(user, "User profile retrieved successfully");

        } catch (Exception e) {
            return new UserProfileResponse(false, "Failed to retrieve user profile: " + e.getMessage());
        }
    }

    
    public UserProfileResponse updateUserProfile(Long userId, UpdateProfileRequest request) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return new UserProfileResponse(false, "User not found");
            }
            
            User user = userOptional.get();
            
            if (!user.getUsername().equals(request.getUsername()) && 
                userRepository.existsByUsername(request.getUsername())) {
                return new UserProfileResponse(false, "Username is already taken");
            }
            
            if (!user.getEmail().equals(request.getEmail()) && 
                userRepository.existsByEmail(request.getEmail())) {
                return new UserProfileResponse(false, "Email is already registered");
            }

            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());

            User updatedUser = userRepository.save(user);

            return buildProfileResponse(updatedUser, "Profile updated successfully");

        } catch (Exception e) {
            return new UserProfileResponse(false, "Failed to update profile: " + e.getMessage());
        }
    }

    
    public AuthResponse changePassword(Long userId, ChangePasswordRequest request) {
        try {
            Optional<User> userOptional = userRepository.findById(userId);
            
            if (userOptional.isEmpty()) {
                return new AuthResponse(false, "User not found");
            }
            
            User user = userOptional.get();
            
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return new AuthResponse(false, "Current password is incorrect");
            }
            
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            return new AuthResponse(true, "Password changed successfully");
            
        } catch (Exception e) {
            return new AuthResponse(false, "Failed to change password: " + e.getMessage());
        }
    }

    
    public UserProfileResponse updateUserAvatar(Long userId, MultipartFile avatarFile) {
        try {
            if (avatarFile == null || avatarFile.isEmpty()) {
                return new UserProfileResponse(false, "Avatar file is required");
            }

            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                return new UserProfileResponse(false, "User not found");
            }

            User user = userOptional.get();

            if (user.getAvatarUrl() != null) {
                avatarStorageService.deleteAvatar(user.getAvatarUrl());
            }

            String storedPath = avatarStorageService.storeAvatar(userId, avatarFile);
            user.setAvatarUrl(storedPath);

            User updatedUser = userRepository.save(user);

            return buildProfileResponse(updatedUser, "Avatar updated successfully");

        } catch (IllegalArgumentException e) {
            return new UserProfileResponse(false, e.getMessage());
        } catch (Exception e) {
            return new UserProfileResponse(false, "Failed to update avatar: " + e.getMessage());
        }
    }

    private UserProfileResponse buildProfileResponse(User user, String message) {
        UserProfileResponse.UserInfo userInfo = new UserProfileResponse.UserInfo(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt(),
                user.getIsAdmin(),
                user.getAvatarUrl()
        );

        return new UserProfileResponse(true, message, userInfo);
    }

    
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

    
    public boolean userExists(Long userId) {
        return userRepository.existsById(userId);
    }

    
    public boolean usernameExists(String username) {
        return userRepository.existsByUsername(username);
    }

    
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    
    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }
}
