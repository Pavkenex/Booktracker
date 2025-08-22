package com.booktracker.dto;

/**
 * DTO for friend request actions (send, accept, reject).
 * Unifies the previously separate friend request DTOs.
 */
public class FriendRequestActionDto {
    private boolean accept;
    private Long friendId;
    
    // Constructors
    public FriendRequestActionDto() {}
    
    public FriendRequestActionDto(boolean accept) {
        this.accept = accept;
    }
    
    public FriendRequestActionDto(Long friendId) {
        this.friendId = friendId;
    }
    
    public FriendRequestActionDto(Long friendId, boolean accept) {
        this.friendId = friendId;
        this.accept = accept;
    }
    
    // Getters and Setters
    public boolean isAccept() {
        return accept;
    }
    
    public void setAccept(boolean accept) {
        this.accept = accept;
    }
    
    // Helper method to convert from old action format
    public static FriendRequestActionDto fromAction(String action) {
        if (action == null) return new FriendRequestActionDto(false);
        return new FriendRequestActionDto("accept".equalsIgnoreCase(action));
    }
    
    // Helper method to get the action as a string
    public String getAction() {
        return accept ? "accept" : "decline";
    }
    
    // Getters and setters for friendId
    public Long getFriendId() {
        return friendId;
    }
    
    public void setFriendId(Long friendId) {
        this.friendId = friendId;
    }
}
