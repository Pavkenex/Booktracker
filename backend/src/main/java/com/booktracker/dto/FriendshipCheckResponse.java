package com.booktracker.dto;

public class FriendshipCheckResponse {
    private boolean areFriends;

    public FriendshipCheckResponse() {}

    public FriendshipCheckResponse(boolean areFriends) {
        this.areFriends = areFriends;
    }

    public boolean isAreFriends() {
        return areFriends;
    }

    public void setAreFriends(boolean areFriends) {
        this.areFriends = areFriends;
    }
}
