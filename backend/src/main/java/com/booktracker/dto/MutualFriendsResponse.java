package com.booktracker.dto;

import java.util.List;

public class MutualFriendsResponse {
    private List<UserDto> mutualFriends;
    private int count;

    public MutualFriendsResponse() {}

    public MutualFriendsResponse(List<UserDto> mutualFriends) {
        this.mutualFriends = mutualFriends;
        this.count = mutualFriends != null ? mutualFriends.size() : 0;
    }

    public List<UserDto> getMutualFriends() {
        return mutualFriends;
    }

    public void setMutualFriends(List<UserDto> mutualFriends) {
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

