ALTER TABLE books ADD COLUMN created_at DATE;
UPDATE books
SET created_at = '2025-08-20'
WHERE id > 0;
ALTER TABLE books MODIFY COLUMN created_at DATE NOT NULL;

