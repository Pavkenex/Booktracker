package com.booktracker.service;

import com.booktracker.dto.AdminStatsResponseDto;
import com.booktracker.repository.BookRepository;
import com.booktracker.repository.GenreRepository;
import com.booktracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminService {
    
    private final BookRepository bookRepository;
    private final GenreRepository genreRepository;
    private final UserRepository userRepository;
    
    public AdminService(BookRepository bookRepository,
                       GenreRepository genreRepository,
                       UserRepository userRepository) {
        this.bookRepository = bookRepository;
        this.genreRepository = genreRepository;
        this.userRepository = userRepository;
    }

    public AdminStatsResponseDto getAdminStats() {
        long totalUsers = userRepository.countTotalUsers();
        long totalBooks = bookRepository.countTotalBooks();
        long totalGenres = genreRepository.count();
        
        return new AdminStatsResponseDto(
            (int) totalUsers,
            (int) totalBooks,
            (int) totalGenres
        );
    }
}
