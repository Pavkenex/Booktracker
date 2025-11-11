package com.booktracker.util;

import com.booktracker.exception.AuthenticationException;
import com.booktracker.security.CustomUserDetailsService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            throw new AuthenticationException("User not authenticated");
        }
        
       
        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetailsService.CustomUserPrincipal customPrincipal) {
            Long userId = customPrincipal.getId();
            if (userId != null) {
                return userId;
            }
        }
        
        throw new AuthenticationException("Unable to extract user ID from authentication context");
    }
    
    
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated();
    }
}
