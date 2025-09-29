package com.booktracker.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "books")
public class Book {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Book title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Column(nullable = false)
    private String title;
    
    @NotBlank(message = "Author is required")
    @Size(max = 255, message = "Author must not exceed 255 characters")
    @Column(nullable = false)
    private String author;
    
    @Column(name = "published_year")
    private Integer publishedYear;
    
    @Size(max = 255, message = "Thumbnail URL must not exceed 255 characters")
    private String thumbnail;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @Column(name = "created_at")
    private java.time.LocalDate createdAt;
    
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "book_genres",
        joinColumns = @JoinColumn(name = "book_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();
    
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<UserBook> userBooks = new HashSet<>();
    
    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Recommendation> recommendations = new HashSet<>();
    
    @OneToOne(mappedBy = "book", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BookView bookView;
    
    public Book() {}
    
    public Book(String title, String author) {
        this.title = title;
        this.author = author;
    }
    
    public Book(String title, String author, Integer publishedYear, String description) {
        this.title = title;
        this.author = author;
        this.publishedYear = publishedYear;
        this.description = description;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public Integer getPublishedYear() {
        return publishedYear;
    }
    
    public void setPublishedYear(Integer publishedYear) {
        this.publishedYear = publishedYear;
    }
    
    public String getThumbnail() {
        return thumbnail;
    }
    
    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public java.time.LocalDate getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(java.time.LocalDate createdAt) {
        this.createdAt = createdAt;
    }
    
    public Set<Genre> getGenres() {
        return genres;
    }
    
    public void setGenres(Set<Genre> genres) {
        this.genres = genres;
    }
    
    public Set<UserBook> getUserBooks() {
        return userBooks;
    }
    
    public void setUserBooks(Set<UserBook> userBooks) {
        this.userBooks = userBooks;
    }
    
    public Set<Recommendation> getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(Set<Recommendation> recommendations) {
        this.recommendations = recommendations;
    }
    
    public BookView getBookView() {
        return bookView;
    }
    
    public void setBookView(BookView bookView) {
        this.bookView = bookView;
    }
    
    public void addGenre(Genre genre) {
        this.genres.add(genre);
        genre.getBooks().add(this);
    }
    
    public void removeGenre(Genre genre) {
        this.genres.remove(genre);
        genre.getBooks().remove(this);
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Book)) return false;
        Book book = (Book) o;
        return id != null && id.equals(book.getId());
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", author='" + author + '\'' +
                ", publishedYear=" + publishedYear +
                ", description='" + description + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}