package com.booktracker.repository;

import com.booktracker.entity.Book;
import com.booktracker.entity.BookView;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class BookViewRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BookViewRepository bookViewRepository;

    private Book book1;
    private Book book2;
    private Book book3;
    private BookView bookView1;
    private BookView bookView2;
    private BookView bookView3;

    @BeforeEach
    void setUp() {
        // Create test books
        book1 = new Book("Popular Book", "Author One", 2023, "Very popular book");
        book2 = new Book("Moderate Book", "Author Two", 2022, "Moderately popular book");
        book3 = new Book("New Book", "Author Three", 2024, "New book with no views");
        
        entityManager.persist(book1);
        entityManager.persist(book2);
        entityManager.persist(book3);
        
        // Create test book views
        bookView1 = new BookView(book1, 150L);
        bookView2 = new BookView(book2, 75L);
        bookView3 = new BookView(book3, 0L);
        
        entityManager.persist(bookView1);
        entityManager.persist(bookView2);
        entityManager.persist(bookView3);
        
        entityManager.flush();
    }

    @Test
    void testFindByBookId_WhenBookViewExists_ShouldReturnBookView() {
        // When
        Optional<BookView> result = bookViewRepository.findByBookId(book1.getId());
        
        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getBook().getId()).isEqualTo(book1.getId());
        assertThat(result.get().getViewCount()).isEqualTo(150L);
    }

    @Test
    void testFindByBookId_WhenBookViewDoesNotExist_ShouldReturnEmpty() {
        // Given
        Book nonExistentBook = new Book("Non-existent Book", "Unknown Author");
        entityManager.persist(nonExistentBook);
        entityManager.flush();
        
        // When
        Optional<BookView> result = bookViewRepository.findByBookId(nonExistentBook.getId());
        
        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void testFindTop10ByOrderByViewCountDesc_ShouldReturnBooksOrderedByViewCount() {
        // When
        List<BookView> result = bookViewRepository.findTop10ByOrderByViewCountDesc();
        
        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getViewCount()).isEqualTo(150L);
        assertThat(result.get(0).getBook().getTitle()).isEqualTo("Popular Book");
        assertThat(result.get(1).getViewCount()).isEqualTo(75L);
        assertThat(result.get(1).getBook().getTitle()).isEqualTo("Moderate Book");
        assertThat(result.get(2).getViewCount()).isEqualTo(0L);
        assertThat(result.get(2).getBook().getTitle()).isEqualTo("New Book");
    }

    @Test
    void testFindTop10ByOrderByViewCountDesc_WithMoreThan10Books_ShouldReturnTop10() {
        // Given - Create additional books with various view counts
        for (int i = 4; i <= 15; i++) {
            Book book = new Book("Book " + i, "Author " + i);
            entityManager.persist(book);
            
            BookView bookView = new BookView(book, (long) (i * 10));
            entityManager.persist(bookView);
        }
        entityManager.flush();
        
        // When
        List<BookView> result = bookViewRepository.findTop10ByOrderByViewCountDesc();
        
        // Then
        assertThat(result).hasSize(10);
        // The highest view count should be 150 (from Book 15 with i=15, 15*10=150)
        // But we also have book1 with 150 views from setUp, so we need to check the actual highest
        assertThat(result.get(0).getViewCount()).isEqualTo(150L); // Either book1 or book15 has 150 views
        // Verify descending order
        for (int i = 0; i < result.size() - 1; i++) {
            assertThat(result.get(i).getViewCount())
                .isGreaterThanOrEqualTo(result.get(i + 1).getViewCount());
        }
        // Verify we have exactly 10 results
        assertThat(result).hasSize(10);
    }

    @Test
    void testFindAllByOrderByViewCountDesc_ShouldReturnAllBooksOrderedByViewCount() {
        // When
        List<BookView> result = bookViewRepository.findAllByOrderByViewCountDesc();
        
        // Then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getViewCount()).isEqualTo(150L);
        assertThat(result.get(1).getViewCount()).isEqualTo(75L);
        assertThat(result.get(2).getViewCount()).isEqualTo(0L);
        
        // Verify descending order
        for (int i = 0; i < result.size() - 1; i++) {
            assertThat(result.get(i).getViewCount())
                .isGreaterThanOrEqualTo(result.get(i + 1).getViewCount());
        }
    }

    @Test
    void testFindByViewCountGreaterThanEqualOrderByViewCountDesc_ShouldReturnFilteredResults() {
        // When
        List<BookView> result = bookViewRepository.findByViewCountGreaterThanEqualOrderByViewCountDesc(50L);
        
        // Then
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getViewCount()).isEqualTo(150L);
        assertThat(result.get(1).getViewCount()).isEqualTo(75L);
        
        // Verify all results meet the criteria
        result.forEach(bookView -> 
            assertThat(bookView.getViewCount()).isGreaterThanOrEqualTo(50L));
    }

    @Test
    void testFindByViewCountGreaterThanEqualOrderByViewCountDesc_WithHighThreshold_ShouldReturnLimitedResults() {
        // When
        List<BookView> result = bookViewRepository.findByViewCountGreaterThanEqualOrderByViewCountDesc(100L);
        
        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getViewCount()).isEqualTo(150L);
        assertThat(result.get(0).getBook().getTitle()).isEqualTo("Popular Book");
    }

    @Test
    void testGetTotalViewCount_ShouldReturnSumOfAllViewCounts() {
        // When
        Long totalViewCount = bookViewRepository.getTotalViewCount();
        
        // Then
        assertThat(totalViewCount).isEqualTo(225L); // 150 + 75 + 0
    }

    @Test
    void testGetTotalViewCount_WithNoBookViews_ShouldReturnZero() {
        // Given
        bookViewRepository.deleteAll();
        entityManager.flush();
        
        // When
        Long totalViewCount = bookViewRepository.getTotalViewCount();
        
        // Then
        assertThat(totalViewCount).isEqualTo(0L);
    }

    @Test
    void testExistsByBookId_WhenBookViewExists_ShouldReturnTrue() {
        // When
        boolean exists = bookViewRepository.existsByBookId(book1.getId());
        
        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByBookId_WhenBookViewDoesNotExist_ShouldReturnFalse() {
        // Given
        Book newBook = new Book("Untracked Book", "Unknown Author");
        entityManager.persist(newBook);
        entityManager.flush();
        
        // When
        boolean exists = bookViewRepository.existsByBookId(newBook.getId());
        
        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void testBookViewEntity_ShouldHaveCorrectRelationships() {
        // When
        Optional<BookView> result = bookViewRepository.findByBookId(book1.getId());
        
        // Then
        assertThat(result).isPresent();
        BookView bookView = result.get();
        assertThat(bookView.getBook()).isNotNull();
        assertThat(bookView.getBook().getTitle()).isEqualTo("Popular Book");
        assertThat(bookView.getBook().getAuthor()).isEqualTo("Author One");
    }

    @Test
    void testIncrementViewCount_ShouldUpdateViewCount() {
        // Given
        Optional<BookView> bookViewOpt = bookViewRepository.findByBookId(book2.getId());
        assertThat(bookViewOpt).isPresent();
        BookView bookView = bookViewOpt.get();
        Long originalCount = bookView.getViewCount();
        
        // When
        bookView.incrementViewCount();
        BookView savedBookView = bookViewRepository.save(bookView);
        
        // Then
        assertThat(savedBookView.getViewCount()).isEqualTo(originalCount + 1);
    }

    @Test
    void testSaveNewBookView_ShouldPersistCorrectly() {
        // Given
        Book newBook = new Book("Test Book", "Test Author");
        entityManager.persist(newBook);
        entityManager.flush();
        
        BookView newBookView = new BookView(newBook, 25L);
        
        // When
        BookView savedBookView = bookViewRepository.save(newBookView);
        
        // Then
        assertThat(savedBookView.getId()).isNotNull();
        assertThat(savedBookView.getBook().getTitle()).isEqualTo("Test Book");
        assertThat(savedBookView.getViewCount()).isEqualTo(25L);
        
        // Verify it can be found
        Optional<BookView> foundBookView = bookViewRepository.findByBookId(newBook.getId());
        assertThat(foundBookView).isPresent();
        assertThat(foundBookView.get().getViewCount()).isEqualTo(25L);
    }
}