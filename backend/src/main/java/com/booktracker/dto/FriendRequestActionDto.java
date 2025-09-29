package com.booktracker.dto;

/**
 * DTO for friend request actions (send, accept, reject).
 * Unifies the previously separate friend request DTOs.
 */
public class FriendRequestActionDto {
    private boolean accept;
    private Long friendId;
    
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
    
    public boolean isAccept() {
        return accept;
    }
    
    public void setAccept(boolean accept) {
        this.accept = accept;
    }
    
    /**
     * Converts legacy action strings into the current DTO representation.
     */
    public static FriendRequestActionDto fromAction(String action) {
        if (action == null) return new FriendRequestActionDto(false);
        return new FriendRequestActionDto("accept".equalsIgnoreCase(action));
    }
    
    /**
     * Returns the legacy action keyword expected by existing clients.
     */
    public String getAction() {
        return accept ? "accept" : "decline";
    }
    
    public Long getFriendId() {
        return friendId;
    }
    
    public void setFriendId(Long friendId) {
        this.friendId = friendId;
    }
}
