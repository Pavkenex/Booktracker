package com.booktracker.dto;

public class FriendRequestResponse {
    private String action; // "accept" or "decline"
    
    public FriendRequestResponse() {}
    
    public FriendRequestResponse(String action) {
        this.action = action;
    }
    
    // Getters and Setters
    public String getAction() {
        return action;
    }
    
    public void setAction(String action) {
        this.action = action;
    }
}