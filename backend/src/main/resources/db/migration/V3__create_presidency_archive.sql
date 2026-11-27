CREATE TABLE archive_category (
    id VARCHAR(32) PRIMARY KEY,
    label VARCHAR(80) CHARACTER SET utf8mb4 NOT NULL
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_event (
    id VARCHAR(100) PRIMARY KEY,
    president_id VARCHAR(64) NOT NULL,
    event_date VARCHAR(10) NOT NULL,
    payload JSON NOT NULL,
    INDEX archive_event_chronology_idx (president_id, event_date, id),
    FOREIGN KEY (president_id) REFERENCES presidents(id)
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_event_category (
    event_id VARCHAR(100) NOT NULL,
    category_id VARCHAR(32) NOT NULL,
    PRIMARY KEY (event_id, category_id),
    FOREIGN KEY (event_id) REFERENCES archive_event(id),
    FOREIGN KEY (category_id) REFERENCES archive_category(id)
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_assessment (
    source_order INT UNSIGNED PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL,
    category_id VARCHAR(32) NOT NULL,
    classification ENUM('POSITIVE', 'NEGATIVE', 'UNASSESSED') NOT NULL,
    weight TINYINT UNSIGNED,
    payload JSON NOT NULL,
    CHECK ((classification = 'UNASSESSED' AND weight IS NULL)
           OR (classification <> 'UNASSESSED' AND weight IS NOT NULL AND weight BETWEEN 1 AND 5)),
    FOREIGN KEY (event_id, category_id) REFERENCES archive_event_category(event_id, category_id)
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_score (
    president_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(32) NOT NULL,
    score TINYINT UNSIGNED,
    status ENUM('CALCULATED', 'NO_EVALUABLE_EVIDENCE', 'UNASSESSED', 'RESEARCH_PENDING') NOT NULL,
    payload JSON NOT NULL,
    PRIMARY KEY (president_id, category_id),
    CHECK ((status = 'CALCULATED' AND score IS NOT NULL AND score BETWEEN 0 AND 10)
           OR (status = 'NO_EVALUABLE_EVIDENCE' AND score IS NOT NULL AND score = 0)
           OR (status IN ('UNASSESSED', 'RESEARCH_PENDING') AND score IS NULL)),
    FOREIGN KEY (president_id) REFERENCES presidents(id),
    FOREIGN KEY (category_id) REFERENCES archive_category(id)
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_statistic_series (
    id VARCHAR(64) PRIMARY KEY,
    metric_id VARCHAR(32) NOT NULL,
    kind ENUM('ORIGINAL', 'SUPPLEMENT') NOT NULL,
    metadata JSON NOT NULL
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_annual_observation (
    series_id VARCHAR(64) NOT NULL,
    observation_year SMALLINT UNSIGNED NOT NULL,
    observation_value DECIMAL(24, 10),
    PRIMARY KEY (series_id, observation_year),
    FOREIGN KEY (series_id) REFERENCES archive_statistic_series(id)
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_term_statistic (
    president_id VARCHAR(64) NOT NULL,
    series_id VARCHAR(64) NOT NULL,
    payload JSON NOT NULL,
    PRIMARY KEY (president_id, series_id),
    FOREIGN KEY (president_id) REFERENCES presidents(id),
    FOREIGN KEY (series_id) REFERENCES archive_statistic_series(id)
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;

CREATE TABLE archive_source_snapshot (
    filename VARCHAR(100) PRIMARY KEY,
    sha256 CHAR(64) NOT NULL,
    metadata JSON NOT NULL
) DEFAULT CHARACTER SET ascii COLLATE ascii_bin;
