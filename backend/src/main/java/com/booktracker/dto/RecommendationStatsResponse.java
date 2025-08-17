package com.booktracker.dto;

public class RecommendationStatsResponse {
    private long sentCount;
    private long receivedCount;

    public RecommendationStatsResponse() {}

    public RecommendationStatsResponse(long sentCount, long receivedCount) {
        this.sentCount = sentCount;
        this.receivedCount = receivedCount;
    }

    public long getSentCount() {
        return sentCount;
    }

    public void setSentCount(long sentCount) {
        this.sentCount = sentCount;
    }

    public long getReceivedCount() {
        return receivedCount;
    }

    public void setReceivedCount(long receivedCount) {
        this.receivedCount = receivedCount;
    }
}
