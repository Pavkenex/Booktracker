package com.booktracker.util;

import com.booktracker.exception.AuthenticationException;
import com.booktracker.security.CustomUserDetailsService;
import com.booktracker.security.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    
    private final JwtUtil jwtUtil;
    
    public SecurityUtils(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }
    
    /**
     * Get current authenticated user ID
     * @return User ID from authentication context
     * @throws AuthenticationException if user is not authenticated
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthenticationException("User not authenticated");
        }
        
        // Try to get user ID from CustomUserPrincipal first
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetailsService.CustomUserPrincipal customPrincipal) {
            Long userId = customPrincipal.getId();
            if (userId != null) {
                return userId;
            }
        }
        
        throw new AuthenticationException("Unable to extract user ID from authentication context");
    }
    
    /**
     * Check if current user is authenticated
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}