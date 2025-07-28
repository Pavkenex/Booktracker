package com.booktracker.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "mySecretKey123456789012345678901234567890");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
    }

    @Test
    void testGenerateToken() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testExtractUsername() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        
        String extractedUsername = jwtUtil.extractUsername(token);
        
        assertEquals(username, extractedUsername);
    }

    @Test
    void testValidateToken() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        
        assertTrue(jwtUtil.validateToken(token, username));
        assertFalse(jwtUtil.validateToken(token, "wronguser"));
    }

    @Test
    void testIsTokenValid() {
        String username = "testuser";
        String token = jwtUtil.generateToken(username);
        
        assertTrue(jwtUtil.isTokenValid(token));
        assertFalse(jwtUtil.isTokenValid("invalid.token.here"));
    }

    @Test
    void testGeneratePasswordResetToken() {
        String email = "test@example.com";
        String resetToken = jwtUtil.generatePasswordResetToken(email);
        
        assertNotNull(resetToken);
        assertTrue(jwtUtil.validatePasswordResetToken(resetToken));
        assertEquals(email, jwtUtil.extractUsername(resetToken));
    }
}