package com.booktracker.dto;

public class FriendRequestRespondRequest {
    private boolean accept;

    public FriendRequestRespondRequest() {}

    public FriendRequestRespondRequest(boolean accept) {
        this.accept = accept;
    }

    public boolean isAccept() {
        return accept;
    }

    public void setAccept(boolean accept) {
        this.accept = accept;
    }
}
