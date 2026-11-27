package kr.presidents.archive.president;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
class PresidentRepository {
    private final JdbcClient jdbc;
    private final ObjectMapper mapper;

    PresidentRepository(JdbcClient jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    List<JsonNode> findAll() {
        return jdbc.sql("SELECT profile FROM presidents ORDER BY first_term_start, id")
                .query((row, index) -> readDocument(row.getString("profile")))
                .list();
    }

    Optional<JsonNode> findById(String id) {
        return jdbc.sql("SELECT profile FROM presidents WHERE id = :id")
                .param("id", id)
                .query((row, index) -> readDocument(row.getString("profile")))
                .optional();
    }

    boolean exists(String id) {
        return jdbc.sql("SELECT EXISTS(SELECT 1 FROM presidents WHERE id = :id)")
                .param("id", id).query(Boolean.class).single();
    }

    List<JsonNode> findEvents(String id) {
        // 조회 대상 대통령의 당시 역할과 공통 사건 본문 결합
        return jdbc.sql("""
                SELECT JSON_SET(e.document, '$.presidentId', p.president_id,
                                '$.presidencyPhase', p.presidency_phase, '$.responsibility', p.responsibility)
                FROM public_event e JOIN public_event_president p ON p.event_id = e.id
                WHERE p.president_id = :id ORDER BY e.occurred_at, e.id
                """)
                .param("id", id)
                .query((row, index) -> readDocument(row.getString(1))).list();
    }

    private JsonNode readDocument(String profile) {
        try {
            return mapper.readTree(profile);
        } catch (JsonProcessingException exception) {
            throw new DataRetrievalFailureException("Invalid stored archive document", exception);
        }
    }
}
