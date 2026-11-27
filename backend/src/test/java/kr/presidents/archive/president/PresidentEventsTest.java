package kr.presidents.archive.president;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PresidentController.class)
class PresidentEventsTest {
    @Autowired MockMvc mvc;
    @MockitoBean PresidentRepository presidents;

    @Test
    void existingPresidentWithoutEventsReturnsArray() throws Exception {
        when(presidents.exists("yun-po-sun")).thenReturn(true);
        when(presidents.findEvents("yun-po-sun")).thenReturn(List.of());
        mvc.perform(get("/api/presidents/yun-po-sun/events"))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    @Test
    void absentPresidentReturnsNotFound() throws Exception {
        mvc.perform(get("/api/presidents/unknown/events")).andExpect(status().isNotFound());
    }
}
