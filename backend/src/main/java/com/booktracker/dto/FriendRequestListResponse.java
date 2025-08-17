package com.booktracker.dto;

import java.util.List;

public class FriendRequestListResponse {
    private List<FriendRequestResponse> requests;
    private int count;

    public FriendRequestListResponse() {}

    public FriendRequestListResponse(List<FriendRequestResponse> requests) {
        this.requests = requests;
        this.count = requests != null ? requests.size() : 0;
    }

    public List<FriendRequestResponse> getRequests() {
        return requests;
    }

    public void setRequests(List<FriendRequestResponse> requests) {
        this.requests = requests;
        this.count = requests != null ? requests.size() : 0;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
