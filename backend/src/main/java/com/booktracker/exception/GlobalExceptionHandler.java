package com.booktracker.exception;

import com.booktracker.dto.AuthResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex, WebRequest request) {
        logger.warn("Validation error on {}: {}", request.getDescription(false), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        response.put("success", false);
        response.put("message", "Validation failed");
        response.put("errors", errors);
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(ValidationException ex, WebRequest request) {
        logger.warn("Custom validation error on {}: {}", request.getDescription(false), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("errors", ex.getErrors());
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateResourceException(DuplicateResourceException ex, WebRequest request) {
        logger.warn("Duplicate resource error on {}: {}", request.getDescription(false), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorizedException(UnauthorizedException ex, WebRequest request) {
        logger.warn("Unauthorized access attempt on {}: {}", request.getDescription(false), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<AuthResponse> handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
        logger.warn("Bad credentials attempt on {}", request.getDescription(false));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(false, "Invalid username/email or password"));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<AuthResponse> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        logger.warn("Authentication failed on {}: {}", request.getDescription(false), ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(false, "Authentication failed: " + ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        logger.warn("Access denied on {}: {}", request.getDescription(false), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Access denied: " + ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {
        logger.warn("Invalid argument on {}: {}", request.getDescription(false), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "Invalid request: " + ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        logger.warn("Resource not found on {}: {}", request.getDescription(false), ex.getMessage());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex, WebRequest request) {
        logger.error("Runtime exception on {}: {}", request.getDescription(false), ex.getMessage(), ex);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "An error occurred: " + ex.getMessage());
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unexpected exception on {}: {}", request.getDescription(false), ex.getMessage(), ex);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", "An unexpected error occurred");
        response.put("timestamp", LocalDateTime.now());
        response.put("path", request.getDescription(false));
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}