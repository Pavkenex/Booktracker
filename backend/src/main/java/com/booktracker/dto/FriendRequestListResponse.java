package com.booktracker.dto;

import java.util.List;

public class FriendRequestListResponse {
    private List<FriendRequestDto> requests;
    private int count;

    public FriendRequestListResponse() {}

    public FriendRequestListResponse(List<FriendRequestDto> requests) {
        this.requests = requests;
        this.count = requests != null ? requests.size() : 0;
    }

    public List<FriendRequestDto> getRequests() {
        return requests;
    }

    public void setRequests(List<FriendRequestDto> requests) {
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
