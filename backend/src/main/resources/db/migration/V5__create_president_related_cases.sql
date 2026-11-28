CREATE TABLE president_related_case (
    id VARCHAR(96) PRIMARY KEY,
    president_id VARCHAR(64) NOT NULL,
    occurred_from VARCHAR(10),
    public_event_id VARCHAR(96),
    document JSON NOT NULL,
    INDEX related_case_chronology_idx (president_id, occurred_from, id),
    FOREIGN KEY (president_id) REFERENCES presidents(id)
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;
