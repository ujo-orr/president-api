package kr.presidents.archive.presence;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.LongSupplier;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.PongMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

@Component
final class PresenceWebSocketHandler extends TextWebSocketHandler {
    private static final long HEARTBEAT_INTERVAL_MS = 10_000;
    private static final long PONG_TIMEOUT_NANOS = TimeUnit.SECONDS.toNanos(30);
    private final Map<String, ActiveSession> sessions = new HashMap<>();
    private final LongSupplier nanoTime;

    PresenceWebSocketHandler() {
        this(System::nanoTime);
    }

    PresenceWebSocketHandler(LongSupplier nanoTime) {
        this.nanoTime = nanoTime;
    }

    private record ActiveSession(WebSocketSession socket, UUID visitorId, long lastPongAt) {}

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        UUID visitorId = readVisitorId(session);
        if (visitorId == null) {
            session.close(CloseStatus.POLICY_VIOLATION);
            return;
        }
        updateSessions(session, visitorId).forEach(this::closeFailedSession);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        updateSessions(session, null).forEach(this::closeFailedSession);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        afterConnectionClosed(session, CloseStatus.SERVER_ERROR);
        closeFailedSession(session);
    }

    @Override
    protected synchronized void handlePongMessage(WebSocketSession session, PongMessage message) {
        sessions.computeIfPresent(session.getId(), (id, active) ->
                new ActiveSession(active.socket(), active.visitorId(), nanoTime.getAsLong()));
    }

    // 무응답 연결 만료와 주기적인 집계 전송
    @Scheduled(fixedDelay = HEARTBEAT_INTERVAL_MS)
    void checkConnections() {
        List<WebSocketSession> failed = new ArrayList<>();
        synchronized (this) {
            long now = nanoTime.getAsLong();
            sessions.values().removeIf(active -> {
                WebSocketSession socket = active.socket();
                if (!socket.isOpen()) {
                    return true;
                }
                if (now - active.lastPongAt() >= PONG_TIMEOUT_NANOS) {
                    failed.add(socket);
                    return true;
                }
                try {
                    socket.sendMessage(new PingMessage());
                    return false;
                } catch (IOException | IllegalStateException exception) {
                    failed.add(socket);
                    return true;
                }
            });
            broadcastCount(failed);
        }
        failed.forEach(this::closeFailedSession);
    }

    // 세션 ID 기준 등록·제거와 집계 전송 순서의 직렬화
    private synchronized List<WebSocketSession> updateSessions(WebSocketSession session, UUID visitorId) {
        String id = session.getId();
        boolean changed = visitorId != null
                ? sessions.putIfAbsent(id, new ActiveSession(session, visitorId, nanoTime.getAsLong())) == null
                : sessions.remove(id) != null;
        List<WebSocketSession> failed = new ArrayList<>();
        if (changed) {
            broadcastCount(failed);
        }
        return failed;
    }

    private void broadcastCount(List<WebSocketSession> failed) {
        boolean changed = true;
        while (changed && !sessions.isEmpty()) {
            sessions.values().removeIf(active -> !active.socket().isOpen());
            long visitors = sessions.values().stream().map(ActiveSession::visitorId).distinct().count();
            TextMessage count = new TextMessage("{\"activeConnections\":" + visitors + "}");
            int previousSize = sessions.size();
            sessions.values().removeIf(active -> {
                WebSocketSession socket = active.socket();
                try {
                    socket.sendMessage(count);
                    return false;
                } catch (IOException | IllegalStateException exception) {
                    failed.add(socket);
                    return true;
                }
            });
            changed = previousSize != sessions.size();
        }
    }

    private UUID readVisitorId(WebSocketSession session) {
        var uri = session.getUri();
        if (uri == null) return null;
        String rawId = UriComponentsBuilder.fromUri(uri).build().getQueryParams().getFirst("visitorId");
        if (rawId == null || rawId.length() != 36) return null;
        try {
            UUID visitorId = UUID.fromString(rawId);
            return visitorId.toString().equalsIgnoreCase(rawId) ? visitorId : null;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private void closeFailedSession(WebSocketSession session) {
        try {
            if (session.isOpen()) {
                session.close(CloseStatus.SERVER_ERROR);
            }
        } catch (IOException ignored) {
            // 활성 연결 집계에서 이미 제거된 세션
        }
    }
}
