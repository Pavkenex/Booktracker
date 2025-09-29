package com.booktracker.dto;

public class NotificationCountResponse {
    private long friendRequests;
    private long recommendations;
    private long total;

    public NotificationCountResponse() {}

    public NotificationCountResponse(long friendRequests, long recommendations, long total) {
        this.friendRequests = friendRequests;
        this.recommendations = recommendations;
        this.total = total;
    }

    public long getFriendRequests() {
        return friendRequests;
    }

    public void setFriendRequests(long friendRequests) {
        this.friendRequests = friendRequests;
    }

    public long getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(long recommendations) {
        this.recommendations = recommendations;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }
}
