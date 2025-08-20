-- Add created_at column to the books table
-- Current date: August 20, 2025

-- Simpler approach using ALTER IGNORE (this will simply add the column if it doesn't exist)
-- If the column already exists, you might see a warning but no error
ALTER TABLE books ADD COLUMN created_at DATE;

-- Update all existing books with today's date
-- Using WHERE id > 0 to satisfy MySQL's safe update mode
UPDATE books
SET created_at = '2025-08-20'
WHERE id > 0;

-- Make the column NOT NULL after populating it
ALTER TABLE books MODIFY COLUMN created_at DATE NOT NULL;

-- Verify the update
-- SELECT id, title, created_at FROM books ORDER BY id;
