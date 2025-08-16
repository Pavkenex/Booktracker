package com.booktracker.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private static final String PASSWORD_RESET_TOKEN_TYPE = "password_reset";
    private static final long PASSWORD_RESET_TOKEN_EXPIRATION = 3600000L; // 1 hour in milliseconds
    private static final String USER_ID_CLAIM = "userId";
    private static final String USERNAME_CLAIM = "username";
    private static final String TOKEN_TYPE_CLAIM = "type";

    @Value("${jwt.secret:mySecretKey}")
    private String secret;

    @Value("${jwt.expiration:86400000}") // 24 hours in milliseconds
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }
        
        try {
            Claims claims = extractAllClaims(token);
            return parseUserIdFromClaims(claims);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }

    private Long parseUserIdFromClaims(Claims claims) {
        Object userIdClaim = claims.get(USER_ID_CLAIM);
        
        if (userIdClaim == null) {
            return null;
        }
        
        if (userIdClaim instanceof Number) {
            return ((Number) userIdClaim).longValue();
        } else if (userIdClaim instanceof String) {
            try {
                return Long.parseLong((String) userIdClaim);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        
        return null;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public String generateToken(String username) {
        return generateToken(username, null);
    }

    public String generateToken(String username, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        if (userId != null) {
            claims.put(USER_ID_CLAIM, userId);
        }
        claims.put(USERNAME_CLAIM, username); // Explicitly store username in claims
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateToken(String token, String username) {
        try {
            String tokenUsername = extractUsername(token);
            return tokenUsername.equals(username) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String generatePasswordResetToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put(TOKEN_TYPE_CLAIM, PASSWORD_RESET_TOKEN_TYPE);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + PASSWORD_RESET_TOKEN_EXPIRATION))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validatePasswordResetToken(String token) {
        try {
            Claims claims = extractAllClaims(token);
            String type = (String) claims.get(TOKEN_TYPE_CLAIM);
            return PASSWORD_RESET_TOKEN_TYPE.equals(type) && !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}