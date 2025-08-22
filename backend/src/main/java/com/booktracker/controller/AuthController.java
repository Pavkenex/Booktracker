package com.booktracker.controller;

import com.booktracker.dto.*;
import com.booktracker.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout() {
        // Since we're using stateless JWT tokens, logout is handled on the client side
        // by removing the token from storage
        return ResponseEntity.ok(new AuthResponse(true, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<AuthResponse> forgotPassword(@Valid @RequestBody PasswordResetDto request) {
        // Ensure it's a request type
        if (!request.isRequestType()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid request type"));
        }
        AuthResponse response = authService.requestPasswordReset(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody PasswordResetDto request) {
        // Ensure it's a confirm type
        if (!request.isConfirmType()) {
            return ResponseEntity.badRequest().body(new AuthResponse(false, "Invalid request type"));
        }
        AuthResponse response = authService.resetPassword(request);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    @GetMapping("/verify-token")
    public ResponseEntity<AuthResponse> verifyToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            if (authService.validateToken(token)) {
                String username = authService.getUsernameFromToken(token);
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