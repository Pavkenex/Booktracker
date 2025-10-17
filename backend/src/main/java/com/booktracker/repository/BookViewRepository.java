package com.booktracker.repository;

import com.booktracker.entity.BookView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookViewRepository extends JpaRepository<BookView, Long> {
    
    
    @Query("SELECT bv FROM BookView bv WHERE bv.book.id = :bookId")
    Optional<BookView> findByBookId(@Param("bookId") Long bookId);
    
    
    List<BookView> findTop10ByOrderByViewCountDesc();
    
    
    List<BookView> findAllByOrderByViewCountDesc();
    
    
    List<BookView> findByViewCountGreaterThanEqualOrderByViewCountDesc(Long minViewCount);
    
    
    @Query("SELECT COALESCE(SUM(bv.viewCount), 0) FROM BookView bv")
    Long getTotalViewCount();
    
    
    boolean existsByBookId(Long bookId);
}
