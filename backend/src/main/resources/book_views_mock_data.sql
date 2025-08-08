-- =====================================================
-- BOOK VIEWS MOCK DATA SCRIPT
-- =====================================================
-- Standalone script to populate book_views table with realistic test data
-- for the Popular Books feature implementation.
--
-- This script should be executed after the main data.sql has been run
-- to ensure all referenced books exist in the database.

-- Verify we're using the correct database
USE booktracker;

-- Clear existing book_views data (optional - remove if you want to preserve existing data)
-- DELETE FROM book_views;

-- Insert realistic view count data for existing books
-- Distribution creates realistic popularity patterns for testing
INSERT IGNORE INTO book_views (book_id, view_count) VALUES 
-- Tier 1: Highly Popular Books (1000+ views)
-- These represent bestsellers, classics, and culturally significant works
(8, 2547),   -- Harry Potter and the Philosopher's Stone - Extremely popular worldwide
(1, 1892),   -- The Great Gatsby - American classic, frequently taught
(3, 1654),   -- 1984 - Dystopian masterpiece, highly relevant
(7, 1423),   -- The Hobbit - Fantasy classic, gateway to Tolkien
(11, 1287),  -- Dune - Sci-fi epic, recent movie adaptation boost
(2, 1156),   -- To Kill a Mockingbird - Literary classic, social importance

-- Tier 2: Very Popular Books (500-999 views)
-- Popular contemporary and classic works
(16, 847),   -- The Hunger Games - YA dystopian phenomenon
(13, 723),   -- Gone Girl - Modern psychological thriller hit
(4, 689),    -- Pride and Prejudice - Beloved romance classic
(12, 634),   -- The Lord of the Rings: Fellowship - Epic fantasy

-- Tier 3: Moderately Popular Books (200-499 views)
-- Well-known books with steady readership
(15, 567),   -- Sapiens - Popular non-fiction, intellectual appeal
(9, 456),    -- The Da Vinci Code - Bestselling mystery thriller
(17, 398),   -- The Fault in Our Stars - YA romance, emotional impact
(14, 342),   -- The Girl with the Dragon Tattoo - Scandinavian crime
(10, 289),   -- The Alchemist - Philosophical, inspirational
(18, 234),   -- The Kite Runner - Literary fiction, cultural significance

-- Tier 4: Less Popular Books (50-199 views)
-- Quality books with smaller but dedicated readership
(20, 87),    -- The Book Thief - Historical fiction, unique narration
(19, 65),    -- Life of Pi - Literary adventure, philosophical themes

-- Tier 5: Niche/Challenging Books (10-49 views)
-- Books that appeal to specific audiences or are more challenging
(6, 43),     -- Lord of the Flies - Classic but darker themes
(5, 29);     -- The Catcher in the Rye - Controversial, polarizing

-- Verification Query
-- Run this to check the data was inserted correctly:
SELECT 
    b.id,
    b.title,
    b.author,
    bv.view_count,
    CASE 
        WHEN bv.view_count >= 1000 THEN 'Highly Popular'
        WHEN bv.view_count >= 500 THEN 'Very Popular'
        WHEN bv.view_count >= 200 THEN 'Moderately Popular'
        WHEN bv.view_count >= 50 THEN 'Less Popular'
        ELSE 'Niche'
    END as popularity_tier
FROM books b 
JOIN book_views bv ON b.id = bv.book_id 
ORDER BY bv.view_count DESC;

-- Additional verification: Check total count
SELECT COUNT(*) as total_books_with_views FROM book_views;

-- Popular books query (top 10)
SELECT 
    b.title,
    b.author,
    bv.view_count
FROM books b 
JOIN book_views bv ON b.id = bv.book_id 
ORDER BY bv.view_count DESC 
LIMIT 10;

-- =====================================================
-- EXECUTION INSTRUCTIONS
-- =====================================================
--
-- METHOD 1: Execute via MySQL command line
-- mysql -u root -p booktracker < backend/src/main/resources/book_views_mock_data.sql
--
-- METHOD 2: Execute within MySQL session
-- mysql -u root -p
-- USE booktracker;
-- source backend/src/main/resources/book_views_mock_data.sql;
--
-- METHOD 3: Copy and paste into MySQL Workbench or similar tool
--
-- PREREQUISITES:
-- 1. MySQL server is running
-- 2. booktracker database exists
-- 3. books table is populated with sample data
-- 4. book_views table exists (created by JPA/Hibernate)
--
-- NOTES:
-- - Uses INSERT IGNORE to prevent duplicate key errors
-- - View counts are realistic and varied for good test coverage
-- - All book_id values reference existing books from the sample data
-- - Creates a realistic distribution for testing popular books features