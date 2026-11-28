package kr.presidents.archive.presence;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PingMessage;
import org.springframework.web.socket.PongMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

class PresenceWebSocketHandlerTest {
    private final PresenceWebSocketHandler handler = new PresenceWebSocketHandler();

    @Test
    void countsSameVisitorOnceUntilTheirLastSocketCloses() throws IOException {
        String visitorId = UUID.randomUUID().toString();
        WebSocketSession first = openSession("first", visitorId);
        WebSocketSession second = openSession("second", visitorId.toUpperCase(Locale.ROOT));
        WebSocketSession observer = openSession("observer");
        handler.afterConnectionEstablished(observer);
        handler.afterConnectionEstablished(first);
        handler.afterConnectionEstablished(second);
        handler.afterConnectionClosed(first, CloseStatus.NORMAL);
        handler.afterConnectionClosed(second, CloseStatus.NORMAL);

        var updates = inOrder(observer);
        updates.verify(observer).sendMessage(count(1));
        updates.verify(observer, times(3)).sendMessage(count(2));
        updates.verify(observer).sendMessage(count(1));
        updates.verifyNoMoreInteractions();
        verify(second, times(2)).sendMessage(count(2));
    }

    @Test
    void closesSessionWithoutValidVisitorId() throws IOException {
        WebSocketSession invalid = openSession("invalid", "not-a-uuid");
        WebSocketSession missing = openSession("missing");
        when(missing.getUri()).thenReturn(URI.create("ws://localhost/ws/presence"));
        handler.afterConnectionEstablished(invalid);
        handler.afterConnectionEstablished(missing);

        verify(invalid).close(CloseStatus.POLICY_VIOLATION);
        verify(missing).close(CloseStatus.POLICY_VIOLATION);
        verify(invalid, never()).sendMessage(any());
        verify(missing, never()).sendMessage(any());
    }

    @Test
    void broadcastsJoinAndLeaveWithoutCountingRepeatedCallbacks() throws IOException {
        WebSocketSession first = openSession("first");
        WebSocketSession second = openSession("second");
        WebSocketSession sameId = openSession("second");
        handler.afterConnectionEstablished(first);
        handler.afterConnectionEstablished(second);
        handler.afterConnectionEstablished(sameId);
        handler.afterConnectionClosed(sameId, CloseStatus.NORMAL);
        handler.afterConnectionClosed(second, CloseStatus.NORMAL);

        var updates = inOrder(first);
        updates.verify(first).sendMessage(count(1));
        updates.verify(first).sendMessage(count(2));
        updates.verify(first).sendMessage(count(1));
        updates.verifyNoMoreInteractions();
        verify(second).sendMessage(count(2));
        verify(sameId, never()).sendMessage(any());
    }

    @Test
    void removesFailedConnectionAndCorrectsCountForRemainingSessions() throws IOException {
        WebSocketSession first = openSession("first");
        WebSocketSession failed = openSession("failed");
        doThrow(new IOException()).when(failed).sendMessage(any());
        handler.afterConnectionEstablished(first);
        handler.afterConnectionEstablished(failed);

        var updates = inOrder(first);
        updates.verify(first).sendMessage(count(1));
        updates.verify(first).sendMessage(count(2));
        updates.verify(first).sendMessage(count(1));
        verify(failed).close(CloseStatus.SERVER_ERROR);
    }

    @Test
    void expiresUnresponsiveSessionAndKeepsSessionWithRecentPong() throws IOException {
        AtomicLong now = new AtomicLong();
        var timedHandler = new PresenceWebSocketHandler(now::get);
        WebSocketSession healthy = openSession("healthy");
        WebSocketSession silent = openSession("silent");
        timedHandler.afterConnectionEstablished(healthy);
        timedHandler.afterConnectionEstablished(silent);

        now.set(Duration.ofSeconds(20).toNanos());
        timedHandler.checkConnections();
        verify(silent).sendMessage(new PingMessage());
        timedHandler.handlePongMessage(healthy, new PongMessage());

        now.set(Duration.ofSeconds(30).toNanos());
        timedHandler.checkConnections();
        timedHandler.afterConnectionClosed(silent, CloseStatus.SERVER_ERROR);
        verify(silent).close(CloseStatus.SERVER_ERROR);
        verify(healthy, never()).close(any());
        var updates = inOrder(healthy);
        updates.verify(healthy).sendMessage(new PingMessage());
        updates.verify(healthy).sendMessage(count(2));
        updates.verify(healthy).sendMessage(new PingMessage());
        updates.verify(healthy).sendMessage(count(1));
        updates.verifyNoMoreInteractions();
    }

    @Test
    void transportErrorRemovesSessionBeforeCloseCallback() throws IOException {
        WebSocketSession first = openSession("first");
        WebSocketSession failed = openSession("failed");
        handler.afterConnectionEstablished(first);
        handler.afterConnectionEstablished(failed);
        handler.handleTransportError(failed, new IOException());
        handler.afterConnectionClosed(failed, CloseStatus.SERVER_ERROR);

        var updates = inOrder(first);
        updates.verify(first).sendMessage(count(1));
        updates.verify(first).sendMessage(count(2));
        updates.verify(first).sendMessage(count(1));
        updates.verifyNoMoreInteractions();
        verify(failed).close(CloseStatus.SERVER_ERROR);
    }

    private static WebSocketSession openSession(String id) {
        return openSession(id, UUID.randomUUID().toString());
    }

    private static WebSocketSession openSession(String id, String visitorId) {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn(id);
        when(session.isOpen()).thenReturn(true);
        when(session.getUri()).thenReturn(URI.create("ws://localhost/ws/presence?visitorId=" + visitorId));
        return session;
    }

    private static TextMessage count(int value) {
        return new TextMessage("{\"activeConnections\":" + value + "}");
    }
}
