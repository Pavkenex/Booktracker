package com.booktracker.dto;

import java.util.List;

public class BookRecommendationsResponse {
    private List<RecommendationResponse> recommendations;
    private int count;

    public BookRecommendationsResponse() {}

    public BookRecommendationsResponse(List<RecommendationResponse> recommendations) {
        this.recommendations = recommendations;
        this.count = recommendations != null ? recommendations.size() : 0;
    }

    public List<RecommendationResponse> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<RecommendationResponse> recommendations) {
        this.recommendations = recommendations;
        this.count = recommendations != null ? recommendations.size() : 0;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
