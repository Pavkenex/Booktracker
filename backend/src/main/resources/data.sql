-- Initial data for Booktracker application
-- This file will be executed on application startup if spring.jpa.hibernate.ddl-auto is set to 'create' or 'create-drop'

-- Insert initial genres
INSERT INTO genres (name) VALUES 
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
('Adventure')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample books
INSERT INTO books (title, author, published_year, description) VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'A classic American novel set in the Jazz Age'),
('To Kill a Mockingbird', 'Harper Lee', 1960, 'A gripping tale of racial injustice and childhood innocence'),
('1984', 'George Orwell', 1949, 'A dystopian social science fiction novel'),
('Pride and Prejudice', 'Jane Austen', 1813, 'A romantic novel of manners'),
('The Catcher in the Rye', 'J.D. Salinger', 1951, 'A controversial novel about teenage rebellion'),
('Lord of the Flies', 'William Golding', 1954, 'A novel about British boys stranded on an uninhabited island'),
('The Hobbit', 'J.R.R. Tolkien', 1937, 'A fantasy adventure novel'),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 1997, 'The first book in the Harry Potter series'),
('The Da Vinci Code', 'Dan Brown', 2003, 'A mystery thriller novel'),
('The Alchemist', 'Paulo Coelho', 1988, 'A philosophical novel about following your dreams')
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Link books to genres (assuming genre IDs 1-20 exist)
INSERT INTO book_genres (book_id, genre_id) VALUES 
-- The Great Gatsby (Fiction)
(1, 1),
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
(10, 1), (10, 9)
ON DUPLICATE KEY UPDATE book_id = VALUES(book_id);

-- Create a default admin user (password will be 'admin123' when hashed)
-- Note: In a real application, this should be done through proper user registration
-- The password hash below is for 'admin123' using BCrypt
INSERT INTO users (username, email, password, is_admin, created_at) VALUES 
('admin', 'admin@booktracker.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', true, NOW()),
('demo_user', 'demo@booktracker.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', false, NOW())
ON DUPLICATE KEY UPDATE username = VALUES(username);

-- Add some sample user books for the demo user (assuming user ID 2 is demo_user)
INSERT INTO user_books (user_id, book_id, status, rating, review, read_date, isFavourite) VALUES 
(2, 1, 'read', 5, 'Amazing classic novel!', '2024-01-15', true),
(2, 3, 'read', 4, 'Thought-provoking dystopian story', '2024-02-20', false),
(2, 7, 'to_read', NULL, NULL, NULL, false),
(2, 8, 'read', 5, 'Magical and wonderful!', '2024-03-10', true)
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);