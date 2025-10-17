package com.booktracker.dto;


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
    
    
    public static FriendRequestActionDto fromAction(String action) {
        if (action == null) return new FriendRequestActionDto(false);
        return new FriendRequestActionDto("accept".equalsIgnoreCase(action));
    }
    
    
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

