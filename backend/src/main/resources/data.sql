-- BookTracker Application - Initial Data Script
-- This file will be executed on application startup when spring.jpa.hibernate.ddl-auto is set to 'update'

-- Insert initial genres
INSERT IGNORE INTO genres (name) VALUES 
('Fiction'),
('Non-Fiction'),
('Mystery'),
('Romance'),
('Science Fiction'),
('Fantasy'),
('Biography'),
('History'),
('Self-Help'),
('Technology'),
('Business'),
('Health'),
('Travel'),
('Cooking'),
('Art'),
('Poetry'),
('Drama'),
('Horror'),
('Thriller'),
('Adventure');

-- Insert sample books with more comprehensive data
INSERT IGNORE INTO books (title, author, published_year, description, thumbnail, created_at) VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.', 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg', '2024-08-15'),
('To Kill a Mockingbird', 'Harper Lee', 1960, 'A gripping tale of racial injustice and childhood innocence in the American South.', 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg', '2024-08-16'),
('1984', 'George Orwell', 1949, 'A dystopian social science fiction novel about totalitarian control and surveillance.', 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg', '2024-08-17'),
('Pride and Prejudice', 'Jane Austen', 1813, 'A romantic novel of manners exploring love, marriage, and social class in Regency England.', 'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg', '2024-08-18'),
('The Catcher in the Rye', 'J.D. Salinger', 1951, 'A controversial novel about teenage rebellion and alienation in post-war America.', 'https://covers.openlibrary.org/b/isbn/9780316769174-M.jpg', '2024-08-19'),
('Lord of the Flies', 'William Golding', 1954, 'A novel about British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.', 'https://covers.openlibrary.org/b/isbn/9780571056866-M.jpg', '2024-08-20'),
('The Hobbit', 'J.R.R. Tolkien', 1937, 'A fantasy adventure novel about Bilbo Baggins and his unexpected journey.', 'https://covers.openlibrary.org/b/isbn/9780547928227-M.jpg', '2025-08-21'),
('Harry Potter and the Philosopher''s Stone', 'J.K. Rowling', 1997, 'The first book in the Harry Potter series about a young wizard discovering his magical heritage.', 'https://covers.openlibrary.org/b/isbn/9780747532699-M.jpg', '2025-08-21'),
('The Da Vinci Code', 'Dan Brown', 2003, 'A mystery thriller novel involving art, history, and religious conspiracy.', 'https://covers.openlibrary.org/b/isbn/9780307474278-M.jpg', '2025-08-21'),
('The Alchemist', 'Paulo Coelho', 1988, 'A philosophical novel about following your dreams and finding your personal legend.', 'https://covers.openlibrary.org/b/isbn/9780061122415-M.jpg', '2024-08-10'),
('Dune', 'Frank Herbert', 1965, 'A science fiction epic set on the desert planet Arrakis, exploring politics, religion, and ecology.', 'https://covers.openlibrary.org/b/isbn/9780441172719-M.jpg', '2024-08-11'),
('The Lord of the Rings: The Fellowship of the Ring', 'J.R.R. Tolkien', 1954, 'The first volume of the epic fantasy trilogy about the quest to destroy the One Ring.', 'https://covers.openlibrary.org/b/isbn/9780547928210-M.jpg', '2024-08-12'),
('Gone Girl', 'Gillian Flynn', 2012, 'A psychological thriller about a marriage gone terribly wrong.', 'https://covers.openlibrary.org/b/isbn/9780307588364-M.jpg', '2024-08-13'),
('The Girl with the Dragon Tattoo', 'Stieg Larsson', 2005, 'A crime thriller combining murder mystery, family saga, love story, and financial intrigue.', 'https://covers.openlibrary.org/b/isbn/9780307269751-M.jpg', '2024-08-14'),
('Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 2011, 'A non-fiction exploration of how Homo sapiens came to dominate the world.', 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg', '2025-08-20'),
('The Hunger Games', 'Suzanne Collins', 2008, 'A dystopian novel about a televised fight to the death in a post-apocalyptic society.', 'https://covers.openlibrary.org/b/isbn/9780439023481-M.jpg', '2025-08-19'),
('The Fault in Our Stars', 'John Green', 2012, 'A young adult novel about two teenagers with cancer who fall in love.', 'https://covers.openlibrary.org/b/isbn/9780525478812-M.jpg', '2025-08-18'),
('The Kite Runner', 'Khaled Hosseini', 2003, 'A novel about friendship, guilt, and redemption set against the backdrop of Afghanistan.', 'https://covers.openlibrary.org/b/isbn/9781594631931-M.jpg', '2025-08-17'),
('Life of Pi', 'Yann Martel', 2001, 'A philosophical adventure novel about a boy stranded on a lifeboat with a Bengal tiger.', 'https://covers.openlibrary.org/b/isbn/9780156027328-M.jpg', '2025-08-16'),
('The Book Thief', 'Markus Zusak', 2005, 'A novel narrated by Death about a young girl living in Nazi Germany who steals books.', 'https://covers.openlibrary.org/b/isbn/9780375842207-M.jpg', '2025-08-15');

-- Link books to genres
INSERT IGNORE INTO book_genres (book_id, genre_id) VALUES 
-- The Great Gatsby (Fiction, Drama)
(1, 1), (1, 17),
-- To Kill a Mockingbird (Fiction, Drama)
(2, 1), (2, 17),
-- 1984 (Fiction, Science Fiction)
(3, 1), (3, 5),
-- Pride and Prejudice (Fiction, Romance)
(4, 1), (4, 4),
-- The Catcher in the Rye (Fiction)
(5, 1),
-- Lord of the Flies (Fiction, Adventure)
(6, 1), (6, 20),
-- The Hobbit (Fantasy, Adventure)
(7, 6), (7, 20),
-- Harry Potter (Fantasy, Adventure)
(8, 6), (8, 20),
-- The Da Vinci Code (Mystery, Thriller)
(9, 3), (9, 19),
-- The Alchemist (Fiction, Self-Help)
(10, 1), (10, 9),
-- Dune (Science Fiction, Adventure)
(11, 5), (11, 20),
-- LOTR Fellowship (Fantasy, Adventure)
(12, 6), (12, 20),
-- Gone Girl (Mystery, Thriller)
(13, 3), (13, 19),
-- Girl with Dragon Tattoo (Mystery, Thriller)
(14, 3), (14, 19),
-- Sapiens (Non-Fiction, History)
(15, 2), (15, 8),
-- Hunger Games (Science Fiction, Adventure)
(16, 5), (16, 20),
-- Fault in Our Stars (Fiction, Romance)
(17, 1), (17, 4),
-- Kite Runner (Fiction, Drama)
(18, 1), (18, 17),
-- Life of Pi (Fiction, Adventure)
(19, 1), (19, 20),
-- Book Thief (Fiction, History)
(20, 1), (20, 8);

-- Create default users (password will be 'admin123' when hashed with BCrypt)
INSERT IGNORE INTO users (username, email, password, is_admin, created_at) VALUES 
('admin', 'admin@booktracker.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', true, NOW()),
('demo_user', 'demo@booktracker.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', false, NOW()),
('bookworm', 'bookworm@booktracker.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', false, NOW()),
('reader123', 'reader@booktracker.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', false, NOW());

-- Add sample user books for demo users
INSERT IGNORE INTO user_books (user_id, book_id, status, rating, review, read_date, is_favourite) VALUES 
-- Demo user's books
(2, 1, 'read', 5, 'Amazing classic novel! The symbolism and writing style are incredible.', '2024-01-15', true),
(2, 3, 'read', 4, 'Thought-provoking dystopian story that feels eerily relevant today.', '2024-02-20', false),
(2, 7, 'to_read', NULL, NULL, NULL, false),
(2, 8, 'read', 5, 'Magical and wonderful! Perfect introduction to the wizarding world.', '2024-03-10', true),
(2, 13, 'currently_reading', NULL, NULL, NULL, false),
-- Bookworm's books
(3, 2, 'read', 5, 'A powerful story about justice and morality. Harper Lee''s masterpiece.', '2024-01-20', true),
(3, 4, 'read', 4, 'Witty and romantic. Austen''s social commentary is brilliant.', '2024-02-15', false),
(3, 11, 'read', 5, 'Epic science fiction at its finest. Complex world-building and politics.', '2024-03-01', true),
(3, 15, 'read', 4, 'Fascinating perspective on human history and development.', '2024-03-15', false),
(3, 16, 'currently_reading', NULL, NULL, NULL, false),
-- Reader123's books
(4, 5, 'read', 3, 'Interesting but depressing. Holden''s voice is unique but can be grating.', '2024-02-10', false),
(4, 9, 'read', 4, 'Fast-paced thriller with interesting historical elements.', '2024-02-25', false),
(4, 17, 'read', 5, 'Heartbreaking and beautiful. Made me cry multiple times.', '2024-03-05', true),
(4, 19, 'read', 4, 'Philosophical and adventurous. The tiger symbolism is fascinating.', '2024-03-20', false),
(4, 12, 'to_read', NULL, NULL, NULL, false);
-- 
=====================================================
-- BOOK VIEWS MOCK DATA - Popular Books Feature
-- =====================================================
-- This section populates the book_views table with realistic test data
-- to demonstrate the popular books functionality.
-- View counts are distributed to create realistic popularity patterns:
-- - Some highly popular books (1000+ views)
-- - Moderately popular books (100-999 views)  
-- - Less popular books (10-99 views)
-- - New/unpopular books (1-9 views)

INSERT IGNORE INTO book_views (book_id, view_count) VALUES 
-- Highly Popular Books (1000+ views)
(8, 2547),   -- Harry Potter - Very popular, especially among young readers
(1, 1892),   -- The Great Gatsby - Classic, often assigned in schools
(3, 1654),   -- 1984 - Dystopian classic, very relevant
(7, 1423),   -- The Hobbit - Popular fantasy
(11, 1287),  -- Dune - Sci-fi masterpiece, recent movie boost
(2, 1156),   -- To Kill a Mockingbird - Classic literature

-- Moderately Popular Books (100-999 views)
(16, 847),   -- The Hunger Games - YA dystopian hit
(13, 723),   -- Gone Girl - Popular thriller
(4, 689),    -- Pride and Prejudice - Romance classic
(12, 634),   -- LOTR Fellowship - Fantasy epic
(15, 567),   -- Sapiens - Popular non-fiction
(9, 456),    -- The Da Vinci Code - Bestselling thriller
(17, 398),   -- The Fault in Our Stars - YA romance
(14, 342),   -- Girl with Dragon Tattoo - Crime thriller
(10, 289),   -- The Alchemist - Philosophical novel
(18, 234),   -- The Kite Runner - Literary fiction

-- Less Popular Books (10-99 views)
(20, 87),    -- The Book Thief - Historical fiction
(19, 65),    -- Life of Pi - Literary adventure
(6, 43),     -- Lord of the Flies - Classic but darker themes
(5, 29);     -- The Catcher in the Rye - Controversial classic

-- Script Execution Instructions:
-- =====================================
-- 
-- AUTOMATIC EXECUTION (Recommended):
-- This script will be automatically executed when the Spring Boot application starts
-- if the following conditions are met:
-- 1. spring.jpa.hibernate.ddl-auto is set to 'update' (default in application.yml)
-- 2. The database connection is properly configured
-- 3. The booktracker database exists (created automatically if createDatabaseIfNotExist=true)
--
-- MANUAL EXECUTION (If needed):
-- If you need to run this script manually in MySQL:
-- 1. Connect to MySQL: mysql -u root -p
-- 2. Use the database: USE booktracker;
-- 3. Execute the script: source /path/to/data.sql;
-- 
-- Or execute directly:
-- mysql -u root -p booktracker < backend/src/main/resources/data.sql
--
-- VERIFICATION:
-- To verify the data was loaded correctly:
-- SELECT b.title, b.author, bv.view_count 
-- FROM books b 
-- JOIN book_views bv ON b.id = bv.book_id 
-- ORDER BY bv.view_count DESC;
--
-- NOTES:
-- - All INSERT statements use IGNORE to prevent duplicate key errors
-- - View counts are realistic and create a good distribution for testing
-- - Book IDs reference the books inserted above
-- - The data supports testing of popular books ranking and filtering features