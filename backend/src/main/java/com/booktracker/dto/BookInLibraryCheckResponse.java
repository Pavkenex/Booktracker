package com.booktracker.dto;

public class BookInLibraryCheckResponse {
    private boolean hasBook;
    private UserBookResponse userBook;

    public BookInLibraryCheckResponse() {}

    public BookInLibraryCheckResponse(boolean hasBook, UserBookResponse userBook) {
        this.hasBook = hasBook;
        this.userBook = userBook;
    }

    public boolean isHasBook() {
        return hasBook;
    }

    public void setHasBook(boolean hasBook) {
        this.hasBook = hasBook;
    }

    public UserBookResponse getUserBook() {
        return userBook;
    }

    public void setUserBook(UserBookResponse userBook) {
        this.userBook = userBook;
    }
}

