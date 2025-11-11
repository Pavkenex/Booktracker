package com.booktracker.dto;

import com.booktracker.entity.User;

public class LoginResult {
    private final User user;
    private final String token;

    public LoginResult(User user, String token) {
        this.user = user;
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public String getToken() {
        return token;
    }
}
