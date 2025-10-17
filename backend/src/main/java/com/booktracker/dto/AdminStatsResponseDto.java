package com.booktracker.dto;


public class AdminStatsResponseDto {
    private int totalUsers;
    private int totalBooks;
    private int totalGenres;

    public AdminStatsResponseDto() {
    }

    public AdminStatsResponseDto(int totalUsers, int totalBooks, int totalGenres) {
        this.totalUsers = totalUsers;
        this.totalBooks = totalBooks;
        this.totalGenres = totalGenres;
    }

    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }

    public int getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(int totalBooks) {
        this.totalBooks = totalBooks;
    }

    public int getTotalGenres() {
        return totalGenres;
    }

    public void setTotalGenres(int totalGenres) {
        this.totalGenres = totalGenres;
    }
}

