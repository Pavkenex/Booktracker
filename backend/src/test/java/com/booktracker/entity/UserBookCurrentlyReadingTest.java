package com.booktracker.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class UserBookCurrentlyReadingTest {

    @Test
    void testCurrentlyReadingStatus() {
        // Test that the currently_reading status exists and can be used
        UserBook.ReadingStatus status = UserBook.ReadingStatus.currently_reading;
        assertNotNull(status);
        assertEquals("currently_reading", status.name());
    }

    @Test
    void testAllReadingStatuses() {
        // Test that all three statuses exist
        UserBook.ReadingStatus[] statuses = UserBook.ReadingStatus.values();
        assertEquals(3, statuses.length);
        
        // Verify all expected statuses are present
        boolean hasRead = false;
        boolean hasCurrentlyReading = false;
        boolean hasToRead = false;
        
        for (UserBook.ReadingStatus status : statuses) {
            switch (status) {
                case read:
                    hasRead = true;
                    break;
                case currently_reading:
                    hasCurrentlyReading = true;
                    break;
                case to_read:
                    hasToRead = true;
                    break;
            }
        }
        
        assertTrue(hasRead, "Should have 'read' status");
        assertTrue(hasCurrentlyReading, "Should have 'currently_reading' status");
        assertTrue(hasToRead, "Should have 'to_read' status");
    }
}