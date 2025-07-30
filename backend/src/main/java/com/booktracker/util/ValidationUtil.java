package com.booktracker.util;

import com.booktracker.exception.ValidationException;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

public class ValidationUtil {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );
    
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{3,20}$");
    
    public static void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ValidationException(createSingleError("email", "Email is required"));
        }
        
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new ValidationException(createSingleError("email", "Invalid email format"));
        }
    }
    
    public static void validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new ValidationException(createSingleError("username", "Username is required"));
        }
        
        if (username.length() < 3 || username.length() > 20) {
            throw new ValidationException(createSingleError("username", "Username must be between 3 and 20 characters"));
        }
        
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new ValidationException(createSingleError("username", "Username can only contain letters, numbers, and underscores"));
        }
    }
    
    public static void validatePassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new ValidationException(createSingleError("password", "Password is required"));
        }
        
        if (password.length() < 6) {
            throw new ValidationException(createSingleError("password", "Password must be at least 6 characters long"));
        }
        
        if (password.length() > 100) {
            throw new ValidationException(createSingleError("password", "Password must not exceed 100 characters"));
        }
    }
    
    public static void validateNotEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(createSingleError(fieldName, fieldName + " is required"));
        }
    }
    
    public static void validateStringLength(String value, String fieldName, int minLength, int maxLength) {
        if (value != null) {
            if (value.length() < minLength) {
                throw new ValidationException(createSingleError(fieldName, 
                    fieldName + " must be at least " + minLength + " characters long"));
            }
            
            if (value.length() > maxLength) {
                throw new ValidationException(createSingleError(fieldName, 
                    fieldName + " must not exceed " + maxLength + " characters"));
            }
        }
    }
    
    public static void validatePositiveNumber(Number value, String fieldName) {
        if (value == null) {
            throw new ValidationException(createSingleError(fieldName, fieldName + " is required"));
        }
        
        if (value.doubleValue() <= 0) {
            throw new ValidationException(createSingleError(fieldName, fieldName + " must be a positive number"));
        }
    }
    
    public static void validateRange(Number value, String fieldName, double min, double max) {
        if (value == null) {
            throw new ValidationException(createSingleError(fieldName, fieldName + " is required"));
        }
        
        double val = value.doubleValue();
        if (val < min || val > max) {
            throw new ValidationException(createSingleError(fieldName, 
                fieldName + " must be between " + min + " and " + max));
        }
    }
    
    public static void validateRating(Integer rating) {
        if (rating != null) {
            validateRange(rating, "rating", 1, 5);
        }
    }
    
    private static Map<String, String> createSingleError(String field, String message) {
        Map<String, String> errors = new HashMap<>();
        errors.put(field, message);
        return errors;
    }
}