CREATE TABLE presidents (
    id VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
    first_term_start CHAR(7) NOT NULL,
    profile JSON NOT NULL,
    INDEX presidents_first_term_idx (first_term_start, id)
) DEFAULT CHARACTER SET utf8mb4;
