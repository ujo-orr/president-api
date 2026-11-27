CREATE TABLE public_event (
    id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    occurred_at VARCHAR(10) CHARACTER SET ascii NOT NULL,
    document JSON NOT NULL
) DEFAULT CHARACTER SET utf8mb4;

CREATE TABLE public_event_president (
    president_id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    event_id VARCHAR(96) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    presidency_phase ENUM('BEFORE', 'DURING', 'AFTER') NOT NULL,
    responsibility TEXT NOT NULL,
    PRIMARY KEY (president_id, event_id),
    FOREIGN KEY (president_id) REFERENCES presidents(id),
    FOREIGN KEY (event_id) REFERENCES public_event(id)
) DEFAULT CHARACTER SET utf8mb4;
