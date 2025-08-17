package com.booktracker.dto;

import java.util.List;

public class MostRecommendedBooksResponse {
    private List<Object[]> mostRecommended;
    private int limit;

    public MostRecommendedBooksResponse() {}

    public MostRecommendedBooksResponse(List<Object[]> mostRecommended, int limit) {
        this.mostRecommended = mostRecommended;
        this.limit = limit;
    }

    public List<Object[]> getMostRecommended() {
        return mostRecommended;
    }

    public void setMostRecommended(List<Object[]> mostRecommended) {
        this.mostRecommended = mostRecommended;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }
}
