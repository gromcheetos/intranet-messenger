package com.hkapp.module.messenger.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class OnlineUserRegistry {

    // userId → number of active WebSocket sessions
    private final ConcurrentHashMap<String, Integer> sessionCountByUser = new ConcurrentHashMap<>();

    public void add(String userId) {
        sessionCountByUser.merge(userId, 1, Integer::sum);
        log.debug("User connected: {} | online count: {}", userId, sessionCountByUser.size());
    }

    public void remove(String userId) {
        sessionCountByUser.computeIfPresent(userId, (k, count) -> count <= 1 ? null : count - 1);
        log.debug("User disconnected: {} | online count: {}", userId, sessionCountByUser.size());
    }

    /** Returns unmodifiable set of online userIds. */
    public Set<String> getOnlineUserIds() {
        return Collections.unmodifiableSet(sessionCountByUser.keySet());
    }

    public boolean isOnline(String userId) {
        return sessionCountByUser.containsKey(userId);
    }

    public int getOnlineCount() {
        return sessionCountByUser.size();
    }
}
