package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.security.JwtUtil;
import com.booktracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    
    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        return ResponseEntity.ok(new AuthResponse(true, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody PasswordResetDto request) {
        if (!request.isRequestType()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid request type"));
        }
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(new AuthResponse(true, "If the email exists, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody PasswordResetDto request) {
        if (!request.isConfirmType()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid request type"));
        }
        authService.resetPassword(request);
        return ResponseEntity.ok(new AuthResponse(true, "Password has been reset successfully"));
    }

    @GetMapping("/verify-token")
    public ResponseEntity<AuthResponse> verifyToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);
            
            if (jwtUtil.validateToken(token, username)) {
                return ResponseEntity.ok(new AuthResponse(true, "Token is valid"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AuthResponse(false, "Invalid or expired token"));
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(false, "Authorization header is missing or invalid"));
        }
    }
}
