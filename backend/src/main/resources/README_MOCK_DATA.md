# BookTracker Mock Data Setup

This directory contains SQL scripts for populating the BookTracker database with realistic test data, specifically for the Popular Books feature.

## Files

### `data.sql`

- **Purpose**: Main initialization script that runs automatically on application startup
- **Contains**:
  - Sample genres
  - Sample books (20 books with comprehensive metadata)
  - Book-genre relationships
  - Sample users
  - Sample user-book relationships
  - Book views data for popularity testing

### `book_views_mock_data.sql`

- **Purpose**: Standalone script specifically for populating book_views table
- **Contains**: Realistic view count data distributed across popularity tiers
- **Use Case**: Manual database setup or testing popular books functionality

## Automatic Execution

The `data.sql` script executes automatically when:

1. Spring Boot application starts
2. `spring.jpa.hibernate.ddl-auto` is set to `update` (default)
3. Database connection is properly configured
4. Tables are created by JPA/Hibernate

## Manual Execution

### Prerequisites

- MySQL server running
- `booktracker` database exists
- Proper database credentials configured

### Method 1: Command Line

```bash
# Execute main data script
mysql -u root -p booktracker < backend/src/main/resources/data.sql

# Execute book views mock data only
mysql -u root -p booktracker < backend/src/main/resources/book_views_mock_data.sql
```

### Method 2: MySQL Session

```sql
mysql -u root -p
USE booktracker;
source backend/src/main/resources/data.sql;
-- or
source backend/src/main/resources/book_views_mock_data.sql;
```

### Method 3: MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Open the SQL script file
4. Execute the script

## Data Distribution

The mock data creates a realistic popularity distribution:

### Book Views Distribution

- **Highly Popular** (1000+ views): 6 books

  - Harry Potter (2,547 views)
  - The Great Gatsby (1,892 views)
  - 1984 (1,654 views)
  - The Hobbit (1,423 views)
  - Dune (1,287 views)
  - To Kill a Mockingbird (1,156 views)

- **Very Popular** (500-999 views): 4 books

  - The Hunger Games (847 views)
  - Gone Girl (723 views)
  - Pride and Prejudice (689 views)
  - LOTR Fellowship (634 views)

- **Moderately Popular** (200-499 views): 6 books

  - Sapiens (567 views)
  - The Da Vinci Code (456 views)
  - The Fault in Our Stars (398 views)
  - Girl with Dragon Tattoo (342 views)
  - The Alchemist (289 views)
  - The Kite Runner (234 views)

- **Less Popular** (50-199 views): 2 books

  - The Book Thief (87 views)
  - Life of Pi (65 views)

- **Niche** (10-49 views): 2 books
  - Lord of the Flies (43 views)
  - The Catcher in the Rye (29 views)

## Verification

After executing the scripts, verify the data with these queries:

```sql
-- Check total books with views
SELECT COUNT(*) as total_books_with_views FROM book_views;

-- View popularity distribution
SELECT
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

-- Top 10 most popular books
SELECT
    b.title,
    b.author,
    bv.view_count
FROM books b
JOIN book_views bv ON b.id = bv.book_id
ORDER BY bv.view_count DESC
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Duplicate Key Errors**

   - Scripts use `INSERT IGNORE` to prevent this
   - If still occurring, clear existing data first

2. **Foreign Key Constraints**

   - Ensure books table is populated before book_views
   - Check that all referenced book_ids exist

3. **Permission Errors**

   - Verify MySQL user has INSERT privileges
   - Check database connection credentials

4. **Table Not Found**
   - Ensure application has run at least once to create tables
   - Check that JPA/Hibernate has created the schema

### Reset Data

```sql
-- Clear all data (use with caution)
DELETE FROM book_views;
DELETE FROM user_books;
DELETE FROM book_genres;
DELETE FROM books;
DELETE FROM genres;
DELETE FROM users;

-- Then re-run the data.sql script
```

## Integration with Popular Books Feature

This mock data supports testing of:

- Popular books ranking (ORDER BY view_count DESC)
- Popularity filtering and pagination
- View count incrementation
- Popular books API endpoints
- Frontend popular books display components

The realistic distribution ensures comprehensive testing across different popularity tiers.
