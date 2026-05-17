-- Idempotent patches for databases created before schema alignment.
-- Safe to re-run: duplicate-column errors are ignored by migrate.js.

USE sukuu_mu;

CREATE OR REPLACE VIEW class_summary AS
SELECT
    c.id,
    c.name,
    c.description,
    c.is_active,
    c.created_at,
    c.updated_at,
    (SELECT COUNT(*) FROM students s WHERE s.class_id = c.id AND s.is_active = 1) AS total_students
FROM classes c;

ALTER TABLE subjects ADD COLUMN credit_hours INT NOT NULL DEFAULT 3;
ALTER TABLE subjects ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1;
