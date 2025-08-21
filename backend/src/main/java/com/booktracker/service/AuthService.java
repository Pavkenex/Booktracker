package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import com.booktracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil,
                      AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        try {
            // Check if username already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                return new AuthResponse(false, "Username is already taken");
            }

            // Check if email already exists
            if (userRepository.existsByEmail(request.getEmail())) {
                return new AuthResponse(false, "Email is already registered");
            }

            // Create new user
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setIsAdmin(false);

            // Save user
            User savedUser = userRepository.save(user);

            return new AuthResponse(true, "User registered successfully");

        } catch (Exception e) {
            return new AuthResponse(false, "Registration failed: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()
                    )
            );

            // Get user details
            User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

            // Generate JWT token
            String token = jwtUtil.generateToken(user.getUsername(), user.getId());

            // Create user info for response
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getIsAdmin()
            );

            return new AuthResponse(true, "Login successful", token, userInfo);

        } catch (AuthenticationException e) {
            return new AuthResponse(false, "Invalid username/email or password");
        } catch (Exception e) {
            return new AuthResponse(false, "Login failed: " + e.getMessage());
        }
    }

    public AuthResponse requestPasswordReset(PasswordResetRequest request) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
            
            if (userOptional.isEmpty()) {
                // For security reasons, don't reveal if email exists or not
                return new AuthResponse(true, "If the email exists, a password reset link has been sent");
            }

            User user = userOptional.get();
            
            // Generate password reset token
            String resetToken = jwtUtil.generatePasswordResetToken(user.getEmail());
            
            // TODO: In a real application, you would send this token via email
            // For now, we'll just return success (the token would be sent via email)
            System.out.println("Password reset token for " + user.getEmail() + ": " + resetToken);
            
            return new AuthResponse(true, "Password reset link has been sent to your email");

        } catch (Exception e) {
            return new AuthResponse(false, "Password reset request failed: " + e.getMessage());
        }
    }

    public AuthResponse resetPassword(PasswordResetConfirmRequest request) {
        try {
            // Validate reset token
            if (!jwtUtil.validatePasswordResetToken(request.getToken())) {
                return new AuthResponse(false, "Invalid or expired reset token");
            }

            // Extract email from token
            String email = jwtUtil.extractUsername(request.getToken());
            
            // Find user by email
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            return new AuthResponse(true, "Password has been reset successfully");

        } catch (Exception e) {
            return new AuthResponse(false, "Password reset failed: " + e.getMessage());
        }
    }

    public boolean validateToken(String token) {
        return jwtUtil.isTokenValid(token);
    }

    public String getUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }
}