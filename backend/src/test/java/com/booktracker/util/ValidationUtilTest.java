package com.booktracker.util;

import com.booktracker.exception.ValidationException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ValidationUtilTest {

    @Test
    void testValidateEmail_ValidEmail() {
        assertDoesNotThrow(() -> ValidationUtil.validateEmail("test@example.com"));
    }

    @Test
    void testValidateEmail_InvalidEmail() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validateEmail("invalid-email"));
    }

    @Test
    void testValidateEmail_EmptyEmail() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validateEmail(""));
    }

    @Test
    void testValidateUsername_ValidUsername() {
        assertDoesNotThrow(() -> ValidationUtil.validateUsername("testuser123"));
    }

    @Test
    void testValidateUsername_TooShort() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validateUsername("ab"));
    }

    @Test
    void testValidateUsername_TooLong() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validateUsername("thisusernameistoolongtobevalid"));
    }

    @Test
    void testValidateUsername_InvalidCharacters() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validateUsername("test-user"));
    }

    @Test
    void testValidatePassword_ValidPassword() {
        assertDoesNotThrow(() -> ValidationUtil.validatePassword("password123"));
    }

    @Test
    void testValidatePassword_TooShort() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validatePassword("12345"));
    }

    @Test
    void testValidatePassword_Empty() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validatePassword(""));
    }

    @Test
    void testValidateNotEmpty_ValidString() {
        assertDoesNotThrow(() -> ValidationUtil.validateNotEmpty("test", "field"));
    }

    @Test
    void testValidateNotEmpty_EmptyString() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validateNotEmpty("", "field"));
    }

    @Test
    void testValidateRating_ValidRating() {
        assertDoesNotThrow(() -> ValidationUtil.validateRating(3));
    }

    @Test
    void testValidateRating_InvalidRating() {
        assertThrows(ValidationException.class, () -> ValidationUtil.validateRating(6));
        assertThrows(ValidationException.class, () -> ValidationUtil.validateRating(0));
    }

    @Test
    void testValidateRating_NullRating() {
        assertDoesNotThrow(() -> ValidationUtil.validateRating(null));
    }
}