package kr.presidents.archive.president;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Optional;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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

    record Axis(String id, String label, Integer score, String status) {}

    record Archive(JsonNode person, List<Axis> scores, List<JsonNode> events, List<JsonNode> assessments,
                   int scoreAdjustmentConstant, int timelineWeightLimit) {}

    // 프로필과 평가 자료의 동일 트랜잭션 조회
    @Transactional(readOnly = true)
    public Optional<Archive> findArchive(String id) {
        return findById(id).map(person -> {
            List<Axis> scores = jdbc.sql("""
                    SELECT c.id, c.label, s.score, s.status
                    FROM archive_score s JOIN archive_category c ON c.id = s.category_id
                    WHERE s.president_id = :id ORDER BY c.id
                    """).param("id", id).query((row, index) -> new Axis(
                            row.getString("id"), row.getString("label"),
                            row.getObject("score", Integer.class), row.getString("status"))).list();
            List<JsonNode> events = jdbc.sql("""
                    SELECT payload FROM archive_event
                    WHERE president_id = :id ORDER BY event_date, id
                    """).param("id", id).query((row, index) -> readDocument(row.getString(1))).list();
            List<JsonNode> assessments = jdbc.sql("""
                    SELECT a.payload FROM archive_assessment a JOIN archive_event e ON e.id = a.event_id
                    WHERE e.president_id = :id ORDER BY a.source_order
                    """).param("id", id).query((row, index) -> readDocument(row.getString(1))).list();
            int adjustment = jdbc.sql("""
                    SELECT JSON_EXTRACT(metadata, '$.scoreAdjustmentConstant')
                    FROM archive_source_snapshot WHERE filename = 'presidency-scores.stage-2.json'
                    """).query(Integer.class).single();
            int limit = jdbc.sql("""
                    SELECT COALESCE(MAX(total), 1) FROM (
                        SELECT SUM(weight) AS total FROM archive_assessment
                        WHERE weight IS NOT NULL GROUP BY event_id, classification
                    ) weights
                    """).query(Integer.class).single();
            return new Archive(person, scores, events, assessments, adjustment, Math.max(1, limit));
        });
    }

    private JsonNode readDocument(String profile) {
        try {
            return mapper.readTree(profile);
        } catch (JsonProcessingException exception) {
            throw new DataRetrievalFailureException("Invalid stored archive document", exception);
        }
    }
}
