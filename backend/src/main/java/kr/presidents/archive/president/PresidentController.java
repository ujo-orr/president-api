package kr.presidents.archive.president;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/presidents")
class PresidentController {
    private final PresidentRepository presidents;

    PresidentController(PresidentRepository presidents) {
        this.presidents = presidents;
    }

    @GetMapping
    List<JsonNode> list() {
        return presidents.findAll();
    }

    @GetMapping("/{id}")
    JsonNode detail(@PathVariable String id) {
        return presidents.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "President not found"));
    }

    @GetMapping("/{id}/events")
    List<JsonNode> events(@PathVariable String id) {
        if (!presidents.exists(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "President not found");
        }
        return presidents.findEvents(id);
    }

    @GetMapping("/{id}/archive")
    PresidentRepository.Archive archive(@PathVariable String id) {
        return presidents.findArchive(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "President not found"));
    }

    @GetMapping("/{id}/related-cases")
    List<JsonNode> relatedCases(@PathVariable String id) {
        if (!presidents.exists(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "President not found");
        }
        return presidents.findRelatedCases(id);
    }
}
