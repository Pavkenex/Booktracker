package com.booktracker.dto;

public class FriendshipStatsResponse {
    private long friendCount;
    private long pendingRequestCount;

    public FriendshipStatsResponse() {}

    public FriendshipStatsResponse(long friendCount, long pendingRequestCount) {
        this.friendCount = friendCount;
        this.pendingRequestCount = pendingRequestCount;
    }

    public long getFriendCount() {
        return friendCount;
    }

    public void setFriendCount(long friendCount) {
        this.friendCount = friendCount;
    }

    public long getPendingRequestCount() {
        return pendingRequestCount;
    }

    public void setPendingRequestCount(long pendingRequestCount) {
        this.pendingRequestCount = pendingRequestCount;
    }
}
