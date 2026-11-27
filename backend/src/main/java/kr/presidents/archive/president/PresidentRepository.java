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
                .query((row, index) -> readProfile(row.getString("profile")))
                .list();
    }

    Optional<JsonNode> findById(String id) {
        return jdbc.sql("SELECT profile FROM presidents WHERE id = :id")
                .param("id", id)
                .query((row, index) -> readProfile(row.getString("profile")))
                .optional();
    }

    private JsonNode readProfile(String profile) {
        try {
            return mapper.readTree(profile);
        } catch (JsonProcessingException exception) {
            throw new DataRetrievalFailureException("Invalid stored president profile", exception);
        }
    }
}
