package com.booktracker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "book_views", indexes = {
    @Index(name = "idx_book_views_view_count", columnList = "view_count DESC")
})
public class BookView {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false, unique = true)
    private Book book;
    
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;
    
    public BookView() {}
    
    public BookView(Book book) {
        this.book = book;
        this.viewCount = 0L;
    }
    
    public BookView(Book book, Long viewCount) {
        this.book = book;
        this.viewCount = viewCount;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Book getBook() {
        return book;
    }
    
    public void setBook(Book book) {
        this.book = book;
    }
    
    public Long getViewCount() {
        return viewCount;
    }
    
    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }
    
    public void incrementViewCount() {
        this.viewCount++;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BookView)) return false;
        BookView bookView = (BookView) o;
        return id != null && id.equals(bookView.getId());
    }
    
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    
    @Override
    public String toString() {
        return "BookView{" +
                "id=" + id +
                ", bookId=" + (book != null ? book.getId() : null) +
                ", viewCount=" + viewCount +
                '}';
    }
}
