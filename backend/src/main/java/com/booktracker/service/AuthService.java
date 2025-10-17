package com.booktracker.service;

import com.booktracker.dto.*;
import com.booktracker.entity.User;
import com.booktracker.repository.UserRepository;
import com.booktracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final JavaMailSender javaMailSender;

    public AuthService(UserRepository userRepository,
                      PasswordEncoder passwordEncoder,
                      JwtUtil jwtUtil,
                      AuthenticationManager authenticationManager,
                      JavaMailSender javaMailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.javaMailSender = javaMailSender;
    }

    public AuthResponse register(RegisterRequest request) {
        try {
            if (userRepository.existsByUsername(request.getUsername())) {
                return new AuthResponse(false, "Username is already taken");
            }

            if (userRepository.existsByEmail(request.getEmail())) {
                return new AuthResponse(false, "Email is already registered");
            }

            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setIsAdmin(false);

            User savedUser = userRepository.save(user);

            return new AuthResponse(true, "User registered successfully");

        } catch (Exception e) {
            return new AuthResponse(false, "Registration failed: " + e.getMessage());
        }
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsernameOrEmail(),
                            request.getPassword()
                    )
            );

            User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

            String token = jwtUtil.generateToken(user.getUsername(), user.getId());

            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getIsAdmin(),
                    user.getAvatarUrl()
            );

            return new AuthResponse(true, "Login successful", token, userInfo);

        } catch (AuthenticationException e) {
            return new AuthResponse(false, "Invalid username/email or password");
        } catch (Exception e) {
            return new AuthResponse(false, "Login failed: " + e.getMessage());
        }
    }

    public AuthResponse requestPasswordReset(PasswordResetDto request) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
            
            if (userOptional.isEmpty()) {
               
                return new AuthResponse(true, "If the email exists, a password reset link has been sent");
            }

            User user = userOptional.get();
            
            String resetToken = jwtUtil.generatePasswordResetToken(user.getEmail());
            
            String resetUrl = "http://localhost:4200/reset-password?token=" + resetToken;
            
            SimpleMailMessage emailMessage = new SimpleMailMessage();
            emailMessage.setTo(user.getEmail());
            emailMessage.setSubject("Password Reset Request");
            emailMessage.setText("Dear " + user.getUsername() + ",\n\n" +
                    "You have requested to reset your password for your BookTracker account.\n\n" +
                    "Please click the following link to reset your password:\n" +
                    resetUrl + "\n\n" +
                    "This link will expire in 1 hour for security reasons.\n\n" +
                    "If you did not request this password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The BookTracker Team");
            
            javaMailSender.send(emailMessage);
            
            return new AuthResponse(true, "Password reset link has been sent to your email");

        } catch (Exception e) {
            return new AuthResponse(false, "Password reset request failed: " + e.getMessage());
        }
    }

    public AuthResponse resetPassword(PasswordResetDto request) {
        try {
            if (!jwtUtil.validatePasswordResetToken(request.getToken())) {
                return new AuthResponse(false, "Invalid or expired reset token");
            }

            String email = jwtUtil.extractUsername(request.getToken());
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

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
