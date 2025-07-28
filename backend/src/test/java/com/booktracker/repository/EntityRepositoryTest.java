package com.booktracker.repository;

import com.booktracker.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class EntityRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private UserBookRepository userBookRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Test
    void testUserEntity() {
        // Given
        User user = new User("testuser", "test@example.com", "password123");
        user.setIsAdmin(false);

        // When
        User savedUser = userRepository.save(user);

        // Then
        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getUsername()).isEqualTo("testuser");
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
        assertThat(savedUser.getIsAdmin()).isFalse();
        assertThat(savedUser.getCreatedAt()).isNotNull();
    }

    @Test
    void testGenreEntity() {
        // Given
        Genre genre = new Genre("Science Fiction");

        // When
        Genre savedGenre = genreRepository.save(genre);

        // Then
        assertThat(savedGenre.getId()).isNotNull();
        assertThat(savedGenre.getName()).isEqualTo("Science Fiction");
    }

    @Test
    void testBookEntity() {
        // Given
        Book book = new Book("Test Book", "Test Author", 2024, "Test description");
        Genre genre = new Genre("Fiction");
        
        entityManager.persist(genre);
        book.addGenre(genre);

        // When
        Book savedBook = bookRepository.save(book);

        // Then
        assertThat(savedBook.getId()).isNotNull();
        assertThat(savedBook.getTitle()).isEqualTo("Test Book");
        assertThat(savedBook.getAuthor()).isEqualTo("Test Author");
        assertThat(savedBook.getPublishedYear()).isEqualTo(2024);
        assertThat(savedBook.getGenres()).hasSize(1);
        assertThat(savedBook.getGenres().iterator().next().getName()).isEqualTo("Fiction");
    }

    @Test
    void testUserBookEntity() {
        // Given
        User user = new User("testuser", "test@example.com", "password123");
        Book book = new Book("Test Book", "Test Author");
        
        entityManager.persist(user);
        entityManager.persist(book);
        
        UserBook userBook = new UserBook(user, book, UserBook.ReadingStatus.read);
        userBook.setRating(5);
        userBook.setReview("Great book!");
        userBook.setReadDate(LocalDate.now());
        userBook.setIsFavourite(true);

        // When
        UserBook savedUserBook = userBookRepository.save(userBook);

        // Then
        assertThat(savedUserBook.getId()).isNotNull();
        assertThat(savedUserBook.getUser().getUsername()).isEqualTo("testuser");
        assertThat(savedUserBook.getBook().getTitle()).isEqualTo("Test Book");
        assertThat(savedUserBook.getStatus()).isEqualTo(UserBook.ReadingStatus.read);
        assertThat(savedUserBook.getRating()).isEqualTo(5);
        assertThat(savedUserBook.getReview()).isEqualTo("Great book!");
        assertThat(savedUserBook.getIsFavourite()).isTrue();
    }

    @Test
    void testFriendshipEntity() {
        // Given
        User user1 = new User("user1", "user1@example.com", "password123");
        User user2 = new User("user2", "user2@example.com", "password123");
        
        entityManager.persist(user1);
        entityManager.persist(user2);
        
        Friendship friendship = new Friendship(user1, user2, Friendship.FriendshipStatus.accepted);

        // When
        Friendship savedFriendship = friendshipRepository.save(friendship);

        // Then
        assertThat(savedFriendship.getId()).isNotNull();
        assertThat(savedFriendship.getUser().getUsername()).isEqualTo("user1");
        assertThat(savedFriendship.getFriend().getUsername()).isEqualTo("user2");
        assertThat(savedFriendship.getStatus()).isEqualTo(Friendship.FriendshipStatus.accepted);
    }

    @Test
    void testRecommendationEntity() {
        // Given
        User sender = new User("sender", "sender@example.com", "password123");
        User receiver = new User("receiver", "receiver@example.com", "password123");
        Book book = new Book("Recommended Book", "Author");
        
        entityManager.persist(sender);
        entityManager.persist(receiver);
        entityManager.persist(book);
        
        Recommendation recommendation = new Recommendation(sender, receiver, book, "You should read this!");

        // When
        Recommendation savedRecommendation = recommendationRepository.save(recommendation);

        // Then
        assertThat(savedRecommendation.getId()).isNotNull();
        assertThat(savedRecommendation.getSender().getUsername()).isEqualTo("sender");
        assertThat(savedRecommendation.getReceiver().getUsername()).isEqualTo("receiver");
        assertThat(savedRecommendation.getBook().getTitle()).isEqualTo("Recommended Book");
        assertThat(savedRecommendation.getMessage()).isEqualTo("You should read this!");
        assertThat(savedRecommendation.getCreatedAt()).isNotNull();
    }

    @Test
    void testUserRepositoryQueries() {
        // Given
        User user = new User("testuser", "test@example.com", "password123");
        userRepository.save(user);

        // When & Then
        Optional<User> foundByUsername = userRepository.findByUsername("testuser");
        assertThat(foundByUsername).isPresent();
        assertThat(foundByUsername.get().getEmail()).isEqualTo("test@example.com");

        Optional<User> foundByEmail = userRepository.findByEmail("test@example.com");
        assertThat(foundByEmail).isPresent();
        assertThat(foundByEmail.get().getUsername()).isEqualTo("testuser");

        boolean usernameExists = userRepository.existsByUsername("testuser");
        assertThat(usernameExists).isTrue();

        boolean emailExists = userRepository.existsByEmail("test@example.com");
        assertThat(emailExists).isTrue();
    }

    @Test
    void testBookRepositoryQueries() {
        // Given
        Book book1 = new Book("Java Programming", "John Doe", 2023, "Learn Java");
        Book book2 = new Book("Python Guide", "Jane Smith", 2022, "Learn Python");
        
        bookRepository.save(book1);
        bookRepository.save(book2);

        // When & Then
        var booksByTitle = bookRepository.findByTitleContainingIgnoreCase("java", 
            org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(booksByTitle.getContent()).hasSize(1);
        assertThat(booksByTitle.getContent().get(0).getTitle()).isEqualTo("Java Programming");

        var booksByAuthor = bookRepository.findByAuthorContainingIgnoreCase("jane", 
            org.springframework.data.domain.PageRequest.of(0, 10));
        assertThat(booksByAuthor.getContent()).hasSize(1);
        assertThat(booksByAuthor.getContent().get(0).getAuthor()).isEqualTo("Jane Smith");
    }
}