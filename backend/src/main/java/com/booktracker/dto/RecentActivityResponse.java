package com.booktracker.dto;

import java.util.List;

public class RecentActivityResponse {
    private List<UserBookResponse> recentActivity;

    public RecentActivityResponse() {}

    public RecentActivityResponse(List<UserBookResponse> recentActivity) {
        this.recentActivity = recentActivity;
    }

    public List<UserBookResponse> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<UserBookResponse> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
