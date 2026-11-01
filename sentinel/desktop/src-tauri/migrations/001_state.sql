PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS schema_version(version INTEGER NOT NULL);
INSERT INTO schema_version(version) SELECT 1 WHERE NOT EXISTS(SELECT 1 FROM schema_version);
CREATE TABLE IF NOT EXISTS workspace (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    payload TEXT NOT NULL CHECK(json_valid(payload)),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
