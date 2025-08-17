package com.booktracker.dto;

public class RecommendationCheckResponse {
    private boolean hasRecommended;

    public RecommendationCheckResponse() {}

    public RecommendationCheckResponse(boolean hasRecommended) {
        this.hasRecommended = hasRecommended;
    }

    public boolean isHasRecommended() {
        return hasRecommended;
    }

    public void setHasRecommended(boolean hasRecommended) {
        this.hasRecommended = hasRecommended;
    }
}
