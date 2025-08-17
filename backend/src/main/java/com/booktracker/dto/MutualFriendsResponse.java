package com.booktracker.dto;

import java.util.List;

public class MutualFriendsResponse {
    private List<UserResponse> mutualFriends;
    private int count;

    public MutualFriendsResponse() {}

    public MutualFriendsResponse(List<UserResponse> mutualFriends) {
        this.mutualFriends = mutualFriends;
        this.count = mutualFriends != null ? mutualFriends.size() : 0;
    }

    public List<UserResponse> getMutualFriends() {
        return mutualFriends;
    }

    public void setMutualFriends(List<UserResponse> mutualFriends) {
        this.mutualFriends = mutualFriends;
        this.count = mutualFriends != null ? mutualFriends.size() : 0;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
